import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import type { AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(dto, request, response);
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.verifyOtp(dto, request, response);
  }

  @Public()
  @Post('resend-otp')
  resendOtp(@Body() dto: ResendOtpDto, @Req() request: Request) {
    return this.authService.resendOtp(dto.otpSessionId, request);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(
    @Req() request: Request & { user: { rawToken: string } },
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refreshWithToken(request.user.rawToken, request, response);
  }

  /**
   * Logout must remain @Public() to break stale-cookie redirect loops.
   *
   * When a refresh token cookie expires but the middleware still sees it as
   * "present", the user gets bounced between /login (middleware → /dashboard)
   * and /dashboard (bootstrap → redirect to /login). The logout endpoint
   * clears the cookie regardless of whether the JWT access token is valid.
   * If it required a valid JWT (i.e. was not @Public()), the global JwtAuthGuard
   * would block it with 401 before clearRefreshTokenCookie() could run —
   * and the stale cookie would persist, keeping the redirect loop alive.
   *
   * The same applies when the refresh token itself is invalid/expired:
   * bootstrap() fails, calls logout() as best-effort cleanup, and logout
   * MUST succeed to clear the cookie so the middleware allows /login through.
   */
  @Public()
  @Post('logout')
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(request, response);
  }

  @Post('logout-all')
  logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logoutAll(user.id, request, response);
  }

  @Get('me')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }
}
