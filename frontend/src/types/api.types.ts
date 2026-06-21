export interface ResponseWarning {
  type: string;
  severity: string;
  message: string;
  conflictingTripId: string;
  conflictingTripNumber: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
  warnings?: ResponseWarning[];
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
