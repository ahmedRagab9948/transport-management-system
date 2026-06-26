export type SectorStatus = 'ACTIVE' | 'INACTIVE';

export type AssignmentReason = 'ASSIGNMENT' | 'TRANSFER' | 'UNASSIGNMENT';

export interface Sector {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: SectorStatus;
  createdAt: string;
  updatedAt: string;
  subSectors: SubSector[];
  _count: { subSectors: number };
}

export interface SubSector {
  id: string;
  sectorId: string;
  name: string;
  code: string;
  description: string | null;
  status: SectorStatus;
  createdAt: string;
  updatedAt: string;
  sector?: Sector;
}

export interface VehicleAssignment {
  id: string;
  vehicleId: string;
  subSectorId: string;
  assignedAt: string;
  unassignedAt: string | null;
  notes: string | null;
  vehicle?: {
    id: string;
    vehicleCode: string;
    type: string;
    status: string;
    manufacturer: string | null;
    model: string | null;
    plates: { id: string; role: string; plateNumber: string }[];
  };
  subSector?: SubSector;
}

export interface VehicleAssignmentHistory {
  id: string;
  vehicleId: string;
  subSectorId: string | null;
  assignedAt: string;
  unassignedAt: string | null;
  transferredFromSubSectorId: string | null;
  reason: AssignmentReason;
  notes: string | null;
  changedById: string | null;
  createdAt: string;
  vehicle?: { id: string; vehicleCode: string };
  subSector?: SubSector;
  transferredFromSubSector?: SubSector;
}

export interface SectorsQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: SectorStatus;
}

export interface PaginatedSectorsResponse {
  items: Sector[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSectorPayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSectorPayload {
  name?: string;
  code?: string;
  description?: string;
  status?: SectorStatus;
}

export interface CreateSubSectorPayload {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubSectorPayload {
  name?: string;
  code?: string;
  description?: string;
  status?: SectorStatus;
}

export interface AssignVehiclePayload {
  subSectorId: string;
  notes?: string;
}

export interface TransferVehiclePayload {
  targetSubSectorId: string;
}

export interface UnassignVehiclePayload {
  notes?: string;
}
