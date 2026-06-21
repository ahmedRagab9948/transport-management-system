export type VehicleType = 'TRAILER' | 'JUMBO';

export type VehicleStatus = 'ACTIVE' | 'IN_TRIP' | 'IN_MAINTENANCE' | 'OUT_OF_SERVICE';

export type VehiclePlateRole = 'TRUCK_HEAD' | 'TRAILER_UNIT' | 'JUMBO';

export interface VehiclePlate {
  id: string;
  vehicleId: string;
  role: VehiclePlateRole;
  plateNumber: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VehicleStatusHistory {
  id: string;
  vehicleId: string;
  oldStatus: VehicleStatus | null;
  newStatus: VehicleStatus;
  changedById: string | null;
  changedAt: string;
  notes: string | null;
}

export interface Vehicle {
  id: string;
  vehicleCode: string;
  type: VehicleType;
  status: VehicleStatus;
  currentDriverId: string | null;
  assignedDriverId: string | null;
  assignedDriver: { id: string; fullName: string; driverCode: string } | null;
  manufacturer: string | null;
  model: string | null;
  productionYear: number | null;
  capacityKg: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  plates: VehiclePlate[];
  statusHistories: VehicleStatusHistory[];
}

export interface VehiclesQueryParams {
   page: number;
  limit: number;
  search?: string;
  vehicleType?: VehicleType;
  status?: VehicleStatus;
  availableOnly?: boolean;
}

export interface UpdateVehiclePlatePayload {
  role: VehiclePlateRole;
  plateNumber: string;
}

export interface CreateVehiclePlatePayload {
  role: VehiclePlateRole;
  plateNumber: string;
}

export interface CreateVehiclePayload {
  vehicleCode: string;
  type: VehicleType;
  status?: VehicleStatus;
  manufacturer?: string;
  model?: string;
  productionYear?: number;
  capacityKg?: number;
  notes?: string;
  assignedDriverId?: string;
  plates: CreateVehiclePlatePayload[];
}

export interface UpdateVehiclePayload {
  vehicleCode?: string;
  type?: VehicleType;
  status?: VehicleStatus;
  manufacturer?: string;
  model?: string;
  productionYear?: number;
  capacityKg?: number;
  notes?: string;
  assignedDriverId?: string;
  plates?: UpdateVehiclePlatePayload[];
}

export interface PaginatedVehiclesResponse {
  items: Vehicle[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
