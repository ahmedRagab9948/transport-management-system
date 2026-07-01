import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import type { AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { Public } from '../../../common/decorators/public.decorator';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockRequest = {} as unknown as Request;
  const mockResponse = {} as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            verifyOtp: jest.fn(),
            resendOtp: jest.fn(),
            refreshWithToken: jest.fn(),
            logout: jest
              .fn()
              .mockResolvedValue({ message: 'Logged out successfully' }),
            logoutAll: jest
              .fn()
              .mockResolvedValue({
                message: 'All sessions revoked successfully',
              }),
            getProfile: jest.fn(),
            getFullProfile: jest.fn(),
            updateProfile: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('logout', () => {
    it('should call authService.logout with request and response', async () => {
      await controller.logout(mockRequest, mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
      );
    });

    it('should return the logout success message', async () => {
      const result = await controller.logout(mockRequest, mockResponse);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should clear the refresh token cookie when service executes (delegated to service)', async () => {
      const clearCookieSpy = jest.fn();
      const resWithCookie = {
        clearCookie: clearCookieSpy,
      } as unknown as Response;
      authService.logout.mockImplementation(async (_req, res) => {
        res.clearCookie('tms_refresh_token');
        return { message: 'Logged out successfully' };
      });
      await controller.logout(mockRequest, resWithCookie);
      expect(clearCookieSpy).toHaveBeenCalledWith('tms_refresh_token');
    });
  });

  describe('@Public() on logout', () => {
    it('should have @Public() decorator on logout method', () => {
      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AuthController.prototype.logout,
      );
      expect(metadata).toBe(true);
    });

    it('should have @Public() decorator on login method', () => {
      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AuthController.prototype.login,
      );
      expect(metadata).toBe(true);
    });

    it('should have @Public() decorator on verifyOtp method', () => {
      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AuthController.prototype.verifyOtp,
      );
      expect(metadata).toBe(true);
    });

    it('should have @Public() decorator on resendOtp method', () => {
      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AuthController.prototype.resendOtp,
      );
      expect(metadata).toBe(true);
    });

    it('should have @Public() decorator on refresh method', () => {
      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AuthController.prototype.refresh,
      );
      expect(metadata).toBe(true);
    });

    it('should NOT have @Public() decorator on logoutAll method', () => {
      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AuthController.prototype.logoutAll,
      );
      expect(metadata).toBeUndefined();
    });

    it('should NOT have @Public() decorator on getProfile method', () => {
      const metadata = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        AuthController.prototype.getProfile,
      );
      expect(metadata).toBeUndefined();
    });
  });

  describe('logoutAll', () => {
    it('should call authService.logoutAll with userId, request, and response', async () => {
      const user: AuthenticatedUser = {
        id: 'user-1',
        email: 'test@test.com',
        fullName: 'Test',
        roleId: 'role-1',
        roleName: 'admin',
        permissions: [],
      };
      await controller.logoutAll(user, mockRequest, mockResponse);
      expect(authService.logoutAll).toHaveBeenCalledWith(
        'user-1',
        mockRequest,
        mockResponse,
      );
    });
  });

  describe('refresh', () => {
    it('should call authService.refreshWithToken with rawToken, request, and response', async () => {
      const mockRefreshRequest = {
        user: { rawToken: 'test-refresh-token' },
      } as unknown as Request & { user: { rawToken: string } };
      await controller.refresh(mockRefreshRequest, mockResponse);
      expect(authService.refreshWithToken).toHaveBeenCalledWith(
        'test-refresh-token',
        mockRefreshRequest,
        mockResponse,
      );
    });
  });

  describe('getProfile', () => {
    it('should call authService.getFullProfile with user id', async () => {
      const user: AuthenticatedUser = {
        id: 'user-1',
        email: 'test@test.com',
        fullName: 'Test',
        roleId: 'role-1',
        roleName: 'admin',
        permissions: [],
      };
      await controller.getProfile(user);
      expect(authService.getFullProfile).toHaveBeenCalledWith('user-1');
    });
  });
});
