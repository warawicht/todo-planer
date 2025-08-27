import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            verifyEmail: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            logout: jest.fn(),
            refreshAccessToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Test123!@#PasswordA',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(authService, 'register').mockResolvedValue({
        id: '1',
        email: registerDto.email,
        password: 'hashed-password',
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
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
      });

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(authService.register).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.firstName,
        registerDto.lastName,
      );
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123!@#PasswordA',
      };

      const response = {
        cookie: jest.fn(),
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const result = await controller.login(loginDto, response as any);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(response.cookie).toHaveBeenCalled();
    });
  });
});