import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiSuccessResponse, WARNINGS_PROPERTY } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const result: ApiSuccessResponse<T> = {
          success: true as const,
          data,
          message: '',
        };

        if (data && typeof data === 'object' && WARNINGS_PROPERTY in (data as Record<string, unknown>)) {
          const record = data as Record<string, unknown>;
          const warnings = record[WARNINGS_PROPERTY];
          delete record[WARNINGS_PROPERTY];
          if (Array.isArray(warnings) && warnings.length > 0) {
            result.warnings = warnings;
          }
        }

        return result;
      }),
    );
  }
}
