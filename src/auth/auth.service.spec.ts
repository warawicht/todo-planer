import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let refreshTokenRepository: Repository<RefreshToken>;
  let rateLimitService: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            findByEmailVerificationToken: jest.fn(),
            findByPasswordResetToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
        {
          provide: RateLimitService,
          useValue: {
            isRateLimited: jest.fn().mockResolvedValue({ isLimited: false, remaining: 1, resetTime: 0 }),
            clearRateLimit: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    rateLimitService = module.get<RateLimitService>(RateLimitService);
    refreshTokenRepository = module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const email = 'test@example.com';
      const password = 'Test123!@#PasswordA';
      const firstName = 'Test';
      const lastName = 'User';

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(undefined);
      jest.spyOn(usersService, 'create').mockResolvedValue({
        id: '1',
        email,
        password: 'hashed-password',
        firstName,
        lastName,
        isEmailVerified: false,
        emailVerificationToken: 'verification-token',
        emailVerificationTokenExpires: new Date(),
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined,
        isActive: true,
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
        tasks: [],
        projects: [],
        tags: [],
        timeBlocks: [],
        taskAttachments: [],
        calendarViewPreference: undefined,
        notifications: [],
        productivityStatistics: [],
        timeEntries: [],
        trendData: [],
        dashboardWidgets: [],
        sharedTasks: [],
        receivedSharedTasks: [],
        assignedTasks: [],
        receivedAssignedTasks: [],
        taskComments: [],
        availability: [],
        userRoles: [],
        activityLogs: [],
        auditTrails: [],
      } as any);

      const result = await service.register(email, password, firstName, lastName);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'Test123!@#PasswordA';

    it('should login a user with valid credentials', async () => {
      const user = {
        id: '1',
        email,
        password: '$2a$12$example_hashed_password',
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationTokenExpires: undefined,
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
        tasks: [],
        projects: [],
        tags: [],
        timeBlocks: [],
        taskAttachments: [],
        calendarViewPreference: undefined,
        notifications: [],
        productivityStatistics: [],
        timeEntries: [],
        trendData: [],
        dashboardWidgets: [],
        sharedTasks: [],
        receivedSharedTasks: [],
        assignedTasks: [],
        receivedAssignedTasks: [],
        taskComments: [],
        availability: [],
        userRoles: [],
        activityLogs: [],
        auditTrails: [],
      } as any;

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.requireMock('bcryptjs').compare.mockResolvedValue(true);
      jest.spyOn(usersService, 'update').mockResolvedValue(user);
      jest.spyOn(service as any, 'generateRefreshToken').mockResolvedValue('refresh-token');

      const result = await service.login(email, password);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('test-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: '1',
        email,
        password: '$2a$12$example_hashed_password',
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationTokenExpires: undefined,
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
        tasks: [],
        projects: [],
        tags: [],
        timeBlocks: [],
        taskAttachments: [],
        calendarViewPreference: undefined,
        notifications: [],
        productivityStatistics: [],
        timeEntries: [],
        trendData: [],
        dashboardWidgets: [],
        sharedTasks: [],
        receivedSharedTasks: [],
        assignedTasks: [],
        receivedAssignedTasks: [],
        taskComments: [],
        availability: [],
        userRoles: [],
        activityLogs: [],
        auditTrails: [],
      } as any);
      jest.requireMock('bcryptjs').compare.mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: '1',
        email,
        password: '$2a$12$example_hashed_password',
        failedLoginAttempts: 0,
        lockoutUntil: futureDate,
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationTokenExpires: undefined,
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
        tasks: [],
        projects: [],
        tags: [],
        timeBlocks: [],
        taskAttachments: [],
        calendarViewPreference: undefined,
        notifications: [],
        productivityStatistics: [],
        timeEntries: [],
        trendData: [],
        dashboardWidgets: [],
        sharedTasks: [],
        receivedSharedTasks: [],
        assignedTasks: [],
        receivedAssignedTasks: [],
        taskComments: [],
        availability: [],
        userRoles: [],
        activityLogs: [],
        auditTrails: [],
      } as any);

      await expect(service.login(email, password)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should rate limit password reset requests', async () => {
      jest.spyOn(rateLimitService, 'isRateLimited').mockResolvedValue({
        isLimited: true,
        remaining: 0,
        resetTime: 0,
      });

      await expect(service.forgotPassword('test@example.com')).rejects.toThrow();
    });
  });

  describe('unlockAccount', () => {
    it('should unlock a locked account', async () => {
      const userId = '1';
      const adminUserId = 'admin-1';
      const user = {
        id: userId,
        email: 'test@example.com',
        failedLoginAttempts: 5,
        lockoutUntil: new Date(),
        firstName: 'Test',
        lastName: 'User',
        isEmailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationTokenExpires: undefined,
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
        tasks: [],
        projects: [],
        tags: [],
        timeBlocks: [],
        taskAttachments: [],
        calendarViewPreference: undefined,
        notifications: [],
        productivityStatistics: [],
        timeEntries: [],
        trendData: [],
        dashboardWidgets: [],
        sharedTasks: [],
        receivedSharedTasks: [],
        assignedTasks: [],
        receivedAssignedTasks: [],
        taskComments: [],
        availability: [],
        userRoles: [],
        activityLogs: [],
        auditTrails: [],
      } as any;

      jest.spyOn(usersService, 'findById').mockResolvedValue(user);
      jest.spyOn(usersService, 'update').mockResolvedValue({
        ...user,
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
      } as any);

      const result = await service.unlockAccount(userId, adminUserId);

      expect(result).toBeDefined();
      expect(result.failedLoginAttempts).toBe(0);
      expect(result.lockoutUntil).toBeUndefined();
      expect(usersService.findById).toHaveBeenCalledWith(userId);
      expect(usersService.update).toHaveBeenCalledWith(userId, {
        failedLoginAttempts: 0,
        lockoutUntil: undefined,
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent';
      const adminUserId = 'admin-1';

      jest.spyOn(usersService, 'findById').mockResolvedValue(undefined);

      await expect(service.unlockAccount(userId, adminUserId)).rejects.toThrow(NotFoundException);
    });
  });
});