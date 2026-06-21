export type DriverStatus = 'ACTIVE' | 'IN_TRIP' | 'INACTIVE' | 'SUSPENDED';

export interface DriverStatusHistory {
  id: string;
  driverId: string;
  oldStatus: DriverStatus | null;
  newStatus: DriverStatus;
  changedById: string | null;
  changedAt: string;
  notes: string | null;
}

export interface Driver {
  id: string;
  driverCode: string;
  fullName: string;
  phone: string;
  nationalId: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: DriverStatus;
  currentVehicleId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  statusHistories: DriverStatusHistory[];
}

export interface DriversQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: DriverStatus;
  availableOnly?: boolean;
}

export interface CreateDriverPayload {
  driverCode: string;
  fullName: string;
  phone: string;
  nationalId: string;
  licenseNumber: string;
  licenseExpiry: string;
  status?: DriverStatus;
  notes?: string;
}

export interface UpdateDriverPayload {
  driverCode?: string;
  fullName?: string;
  phone?: string;
  nationalId?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status?: DriverStatus;
  notes?: string;
}

export interface PaginatedDriversResponse {
  items: Driver[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
