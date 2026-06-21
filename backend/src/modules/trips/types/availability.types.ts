export type WarningType = 'SCHEDULE_OVERLAP' | 'DATE_OVERLAP';

export interface AvailabilityWarning {
  type: WarningType;
  severity: 'SOFT';
  message: string;
  conflictingTripId: string;
  conflictingTripNumber: string;
}

export interface AvailabilityResult {
  available: boolean;
  warnings: AvailabilityWarning[];
}
