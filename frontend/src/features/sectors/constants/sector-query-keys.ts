import { QUERY_KEYS } from '@tms/shared';
import type { SectorsQueryParams } from '../types/sector.types';

export const sectorKeys = {
  all: [QUERY_KEYS.SECTORS] as const,
  lists: () => [...sectorKeys.all, 'list'] as const,
  list: (params: SectorsQueryParams) => [...sectorKeys.all, 'list', params] as const,
  details: () => [...sectorKeys.all, 'detail'] as const,
  detail: (id: string) => [...sectorKeys.all, 'detail', id] as const,
  subSectors: (sectorId: string) => [...sectorKeys.all, 'sub-sectors', sectorId] as const,
  subSector: (id: string) => [...sectorKeys.all, 'sub-sectors', id] as const,
  assignments: () => [QUERY_KEYS.VEHICLE_ASSIGNMENTS] as const,
  assignment: (vehicleId: string) => [QUERY_KEYS.VEHICLE_ASSIGNMENTS, vehicleId] as const,
  assignmentHistory: (vehicleId: string) => [QUERY_KEYS.VEHICLE_ASSIGNMENTS, 'history', vehicleId] as const,
};
