import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateSecureToken } from '../../../common/utils/crypto.util';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private get otpLength(): number {
    return this.configService.get<number>('otp.length', 6);
  }

  private get expiresMinutes(): number {
    return this.configService.get<number>('otp.expiresMinutes', 10);
  }

  private get bcryptRounds(): number {
    return this.configService.get<number>('auth.bcryptRounds', 12);
  }

  private generateNumericCode(): string {
    const max = 10 ** this.otpLength;
    const value = Math.floor(Math.random() * max);
    return value.toString().padStart(this.otpLength, '0');
  }

  async createForUser(userId: string): Promise<{ id: string; expiresAt: Date; code: string }> {
    await this.prisma.otpVerification.updateMany({
      where: { userId, verifiedAt: null },
      data: { verifiedAt: new Date() },
    });

    const code = this.generateNumericCode();
    const otpCodeHash = await bcrypt.hash(code, this.bcryptRounds);
    const expiresAt = new Date(Date.now() + this.expiresMinutes * 60 * 1000);

    const record = await this.prisma.otpVerification.create({
      data: {
        userId,
        otpCode: otpCodeHash,
        expiresAt,
      },
    });

    return { id: record.id, expiresAt, code };
  }

  async resend(otpSessionId: string): Promise<{ id: string; expiresAt: Date; code: string }> {
    const existing = await this.prisma.otpVerification.findUnique({
      where: { id: otpSessionId },
    });

    if (!existing || existing.verifiedAt) {
      throw new BadRequestException('Invalid or expired OTP session');
    }

    return this.createForUser(existing.userId);
  }

  async verifyAndConsume(otpSessionId: string, code: string) {
    const record = await this.prisma.otpVerification.findUnique({
      where: { id: otpSessionId },
      include: {
        user: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!record || record.verifiedAt) {
      throw new UnauthorizedException('Invalid or expired OTP session');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    const user = record.user;

    if (!user || user.deletedAt || !user.isActive) {
      throw new UnauthorizedException('Account is not available');
    }

    const isValid = await bcrypt.compare(code, record.otpCode);

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    });

    return user;
  }

  /** Dev-only helper: log OTP when SMTP is not configured */
  logOtpForDevelopment(email: string, code: string): void {
    if (this.configService.get<string>('app.nodeEnv') === 'production') {
      return;
    }

    // eslint-disable-next-line no-console
    console.info(`[OTP] ${email}: ${code} (expires in ${this.expiresMinutes}m)`);
  }
}
