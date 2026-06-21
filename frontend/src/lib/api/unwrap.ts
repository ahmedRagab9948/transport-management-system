import axios, { type AxiosResponse } from 'axios';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types/api.types';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errorCode?: string,
    public readonly warnings?: any[],
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export function unwrapApiResponse<T>(response: AxiosResponse<ApiSuccessResponse<T> | ApiErrorResponse>): T {
  const body = response.data;

  if (!body.success) {
    throw new ApiRequestError(body.message, response.status, body.errorCode);
  }

  const data = body.data as T & { warnings?: any[] };

  if (body.warnings && body.warnings.length > 0) {
    data.warnings = body.warnings as any;
  }

  return data as T;
}

export function unwrapApiResponseWithWarnings<T>(
  response: AxiosResponse<ApiSuccessResponse<T> | ApiErrorResponse>,
): { data: T; warnings?: any[] } {
  const body = response.data;

  if (!body.success) {
    throw new ApiRequestError(body.message, response.status, body.errorCode);
  }

  return { data: body.data, warnings: body.warnings };
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorResponse | undefined;

    if (body && body.success === false) {
      return body.message;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function getApiWarnings(error: unknown): any[] | undefined {
  if (error instanceof ApiRequestError) {
    return error.warnings;
  }
  return undefined;
}
