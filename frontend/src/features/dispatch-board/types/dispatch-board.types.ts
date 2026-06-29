import type { TripStatus } from '@/features/trips/types/trip.types';
import type { ColumnGroupId } from '../constants/column-groups';

export interface DispatchBoardTrip {
  id: string;
  tripNumber: string;
  clientId: string | null;
  client: { id: string; companyName: string } | null;
  contract: { id: string; contractNumber: string; contractType: string } | null;
  vehicleId: string;
  vehicle: { id: string; vehicleCode: string; plates: Array<{ plateNumber: string; role: string }> };
  driverId: string;
  driver: { id: string; fullName: string; phone: string; driverCode: string };
  status: TripStatus;
  fromLocation: string;
  toLocation: string;
  cargoDescription: string | null;
  startDate: string | null;
  endDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  waitingStartedAt: string | null;
  waitingEndedAt: string | null;
  price: string | null;
  notes: string | null;
  createdById: string;
  createdBy: { id: string; fullName: string; email: string };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  ageMinutes: number;
}

export interface DispatchBoardStats {
  draft: number;
  pending: number;
  assigned: number;
  driver_confirmed: number;
  loading: number;
  on_route: number;
  waiting: number;
  unloading: number;
  completed: number;
  cancelled: number;
  waitingOver30min: number;
  waitingOver60min: number;
  availableVehicles: number;
  availableDrivers: number;
}

export interface DispatchBoardResponse {
  groups: Record<ColumnGroupId, { statuses: TripStatus[]; trips: DispatchBoardTrip[] }>;
}

export interface AvailableResource {
  id: string;
  isAvailable: boolean;
}

export interface VehicleResource extends AvailableResource {
  vehicleCode: string;
  type: string;
  status: string;
  assignedDriver: { id: string; fullName: string } | null;
}

export interface DriverResource extends AvailableResource {
  fullName: string;
  phone: string;
  driverCode: string;
  status: string;
  currentVehicleId: string | null;
}

export interface AvailableResourcesResponse {
  vehicles: VehicleResource[];
  drivers: DriverResource[];
}
