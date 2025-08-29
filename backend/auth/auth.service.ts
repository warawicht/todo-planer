import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './refresh-token.entity';
import { RateLimitService } from './rate-limit.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rateLimitService: RateLimitService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(email: string, password: string, firstName?: string, lastName?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password strength
    if (!this.isPasswordStrong(password)) {
      throw new BadRequestException('Password is not strong enough');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generate email verification token
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // 24 hours

    // Save verification token
    await this.usersService.update(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpires,
    });

    // TODO: Send verification email
    // this.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new UnauthorizedException('Account is locked');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Handle failed login attempts
      await this.handleFailedLoginAttempt(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts
    if (user.failedLoginAttempts > 0) {
      await this.usersService.update(user.id, {
        failedLoginAttempts: 0,
        lockoutUntil: undefined as any,
      });
    }

    // Update last login timestamp
    await this.usersService.update(user.id, {
      updatedAt: new Date(),
    });

    // Generate tokens
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = await this.generateRefreshToken(user.id);
    
    return { accessToken, refreshToken };
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user || !user.emailVerificationTokenExpires || user.emailVerificationTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user as verified
    const updatedUser = await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: undefined as any,
      emailVerificationTokenExpires: undefined as any,
    });

    return updatedUser;
  }

  async forgotPassword(email: string): Promise<void> {
    // Rate limit password reset requests (1 per email per 5 minutes)
    const rateLimitKey = `password_reset:${email}`;
    const rateLimit = await this.rateLimitService.isRateLimited(rateLimitKey, 1, 300);
    
    if (rateLimit.isLimited) {
      throw new HttpException(
        'Too many password reset requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // We don't reveal whether the email exists or not for security reasons
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 24); // 24 hours

    // Save reset token
    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetTokenExpires: resetTokenExpires,
    });

    // TODO: Send password reset email
    // this.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password strength
    if (!this.isPasswordStrong(newPassword)) {
      throw new BadRequestException('Password is not strong enough');
    }

    // Find user with valid reset token
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetTokenExpires || user.passwordResetTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined as any,
      passwordResetTokenExpires: undefined as any,
    });

    // Clear rate limit for this user's password reset requests
    const rateLimitKey = `password_reset:${user.email}`;
    await this.rateLimitService.clearRateLimit(rateLimitKey);

    // TODO: Send password change confirmation email
    // this.sendPasswordChangeConfirmationEmail(user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    // Revoke refresh token
    await this.refreshTokenRepository.update(
      { token: refreshToken },
      { isRevoked: true },
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Find refresh token
    const token = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (token.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check if token is revoked
    if (token.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Revoke current token
    await this.refreshTokenRepository.update(token.id, { isRevoked: true });

    // Generate new tokens
    const payload = { sub: token.user.id, email: token.user.email };
    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.generateRefreshToken(token.user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async unlockAccount(userId: string, adminUserId: string): Promise<User> {
    // Verify that the admin user has permission to unlock accounts
    // In a real implementation, you would check roles/permissions here
    // For now, we'll just assume the admin user is valid
    
    // Find the user to unlock
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Unlock the account
    const updatedUser = await this.usersService.update(userId, {
      failedLoginAttempts: 0,
      lockoutUntil: undefined as any,
    });

    // TODO: Send unlock notification email
    // this.sendAccountUnlockedEmail(user.email);

    return updatedUser;
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  private isPasswordStrong(password: string): boolean {
    // At least 8 characters, with mixed case, numbers, and special characters
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return strongPasswordRegex.test(password);
  }

  private async handleFailedLoginAttempt(user: User): Promise<void> {
    const failedAttempts = user.failedLoginAttempts + 1;
    const updateData: Partial<User> = { failedLoginAttempts: failedAttempts };

    // Lock account after 5 failed attempts
    if (failedAttempts >= 5) {
      const lockoutUntil = new Date();
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 30); // 30 minutes
      updateData.lockoutUntil = lockoutUntil;
      
      // TODO: Send lockout notification email
      // this.sendLockoutNotificationEmail(user.email);
    }

    await this.usersService.update(user.id, updateData);
  }
}