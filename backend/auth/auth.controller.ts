import { Controller, Post, Body, Get, Query, Put, UseGuards, Req, Res, HttpCode, UsePipes, ValidationPipe, Param } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;
    const user = await this.authService.register(email, password, firstName, lastName);
    return {
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = loginDto;
    const { accessToken, refreshToken } = await this.authService.login(email, password);
    
    // Set refresh token in http-only cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return {
      success: true,
      accessToken,
      refreshToken, // Include refreshToken in response for testing purposes
      user: {
        email,
      },
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.authService.verifyEmail(token);
    return {
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    await this.authService.forgotPassword(email);
    return {
      success: true,
      message: 'If your email exists in our system, you will receive a password reset link.',
    };
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    await this.authService.resetPassword(token, newPassword);
    return {
      success: true,
      message: 'Password reset successfully',
    };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body('refreshToken') refreshTokenFromBody?: string,
  ) {
    // Get refresh token from cookie or body (body is used for testing)
    const refreshToken = (request.cookies && request.cookies.refreshToken) || refreshTokenFromBody;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    
    // Clear refresh token cookie
    response.clearCookie('refreshToken');
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
      return {
        success: false,
        message: 'Refresh token not provided',
      };
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshAccessToken(refreshToken);
      
      // Set new refresh token in http-only cookie
      response.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return {
        success: true,
        accessToken,
      };
    } catch (error) {
      // Clear invalid refresh token cookie
      response.clearCookie('refreshToken');
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request: Request) {
    return {
      success: true,
      user: (request as any).user,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(
    @Req() request: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const { firstName, lastName } = updateProfileDto;
    const user = await this.usersService.update((request as any).user.id, {
      firstName,
      lastName,
    });
    
    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Post('unlock-account/:userId')
  @UseGuards(JwtAuthGuard)
  async unlockAccount(
    @Param('userId') userId: string,
    @Req() request: Request,
  ) {
    // In a real implementation, you would check if the user has admin privileges
    const adminUserId = (request as any).user.id;
    const user = await this.authService.unlockAccount(userId, adminUserId);
    
    return {
      success: true,
      message: 'Account unlocked successfully',
      user: {
        id: user.id,
        email: user.email,
        failedLoginAttempts: user.failedLoginAttempts,
        lockoutUntil: user.lockoutUntil,
      },
    };
  }
}