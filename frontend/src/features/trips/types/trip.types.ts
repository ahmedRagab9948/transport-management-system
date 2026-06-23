export type TripStatus = 'DRAFT' | 'PENDING' | 'ASSIGNED' | 'DRIVER_CONFIRMED' | 'LOADING' | 'ON_ROUTE' | 'WAITING' | 'UNLOADING' | 'COMPLETED' | 'CANCELLED';

export interface TripStatusHistory {
  id: string;
  tripId: string;
  oldStatus: TripStatus | null;
  newStatus: TripStatus;
  changedById: string | null;
  changedAt: string;
  reasonCode: string | null;
  notes: string | null;
  changedBy?: { id: string; fullName: string } | null;
}

export interface Trip {
  id: string;
  tripNumber: string;
  clientId: string | null;
  client?: { id: string; companyName: string } | null;
  contract?: {
    id: string;
    contractNumber: string;
    contractType: string;
  } | null;
  vehicleId: string;
  driverId: string;
  status: TripStatus;
  fromLocation: string;
  toLocation: string;
  cargoDescription: string | null;
  startDate: string | null;
  endDate: string | null;
  actualEndDate: string | null;
  price: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  vehicle: {
    id: string;
    vehicleCode: string;
    plates: Array<{ plateNumber: string; role: string }>;
  };
  driver: {
    id: string;
    fullName: string;
    phone: string;
  };
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
  statusHistories: TripStatusHistory[];
  warnings?: Array<{
    type: string;
    severity: string;
    message: string;
    conflictingTripId: string;
    conflictingTripNumber: string;
  }>;
}

export interface TripTableRow extends Trip {
  formattedTripNumber: string;
  route: string;
  contractDisplay: string;
  clientDisplay: string;
}

export interface TripsQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: TripStatus;
  activeOnly?: boolean;
  clientId?: string;
  driverId?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateTripPayload {
  tripNumber: string;
  clientId?: string;
  contractId?: string;
  vehicleId: string;
  driverId: string;
  fromLocation: string;
  toLocation: string;
  status?: TripStatus;
  cargoDescription?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateTripPayload {
  tripNumber?: string;
  vehicleId?: string;
  driverId?: string;
  fromLocation?: string;
  toLocation?: string;
  status?: TripStatus;
  cargoDescription?: string;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  notes?: string;
}

export interface PaginatedTripsResponse {
  items: Trip[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}
