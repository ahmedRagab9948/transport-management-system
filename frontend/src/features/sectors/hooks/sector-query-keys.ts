import type { SectorsQueryParams } from '../types/sector.types';

export const sectorKeys = {
  all: ['sectors'] as const,
  lists: () => [...sectorKeys.all, 'list'] as const,
  list: (params: SectorsQueryParams) => [...sectorKeys.all, 'list', params] as const,
  details: () => [...sectorKeys.all, 'detail'] as const,
  detail: (id: string) => [...sectorKeys.all, 'detail', id] as const,
  subSectors: (sectorId: string) => [...sectorKeys.all, 'sub-sectors', sectorId] as const,
  assignments: () => ['vehicle-assignments'] as const,
  assignment: (vehicleId: string) => ['vehicle-assignments', vehicleId] as const,
  assignmentHistory: (vehicleId: string) => ['vehicle-assignments', 'history', vehicleId] as const,
};
