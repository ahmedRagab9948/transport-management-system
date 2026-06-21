import { Request } from 'express';

export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim();
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }

  return request.ip;
}

export function getUserAgent(request: Request): string | undefined {
  const agent = request.headers['user-agent'];
  return typeof agent === 'string' ? agent : undefined;
}
