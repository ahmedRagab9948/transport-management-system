import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: () => void): void {
    const { method, originalUrl } = req;
    const start = Date.now();
    const userId = (req as unknown as { user?: { id?: string } }).user?.id;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      if (statusCode >= 500) {
        this.logger.error(`${method} ${originalUrl} ${statusCode} ${duration}ms`, userId ?? 'anonymous');
      } else if (statusCode >= 400) {
        this.logger.warn(`${method} ${originalUrl} ${statusCode} ${duration}ms`, userId ?? 'anonymous');
      } else {
        this.logger.log(`${method} ${originalUrl} ${statusCode} ${duration}ms`, userId ?? 'anonymous');
      }
    });

    next();
  }
}