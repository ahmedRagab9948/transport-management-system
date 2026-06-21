import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const TIERS: Record<string, { windowMs: number; maxRequests: number }> = {
  global: { windowMs: 60_000, maxRequests: 300 },
  auth: { windowMs: 60_000, maxRequests: 30 },
  search: { windowMs: 60_000, maxRequests: 60 },
  export: { windowMs: 60_000, maxRequests: 20 },
};

function identifyTier(path: string): string {
  if (path.includes('/auth/')) return 'auth';
  if (path.includes('/export') || path.includes('export-csv')) return 'export';
  if (path.includes('search') || path.includes('search=')) return 'search';
  return 'global';
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.ip ?? 'unknown';
    const path = request.route?.path ?? request.url;
    const tier = identifyTier(path);
    const config = TIERS[tier];

    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + config.windowMs });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${key} on ${path} (tier: ${tier})`);
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          errorCode: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Try again in ${Math.ceil((entry.resetAt - now) / 1000)}s.`,
          timestamp: new Date().toISOString(),
          path: request.url,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    return true;
  }
}