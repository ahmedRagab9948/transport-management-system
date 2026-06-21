export interface DashboardSummary {
  totalTrips: number;
  activeTrips: number;
  availableVehicles: number;
  activeDrivers: number;
  activeContracts: number;
  activeClients: number;
  expiringContracts: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface MonthlyTripCount {
  month: string;
  count: number;
}

export interface RecentTrip {
  id: string;
  tripNumber: string;
  status: string;
  createdAt: string;
  fromLocation: string;
  toLocation: string;
}

export interface RecentContract {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  updatedAt: string;
  client: { companyName: string };
}

export interface RecentVehicleChange {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  changedAt: string;
  notes: string | null;
  vehicle: { vehicleCode: string };
  changedBy: { fullName: string } | null;
}

export interface RecentActivity {
  recentTrips: RecentTrip[];
  recentContracts: RecentContract[];
  recentVehicleChanges: RecentVehicleChange[];
}

export interface ExpiringContract {
  id: string;
  contractNumber: string;
  title: string;
  endDate: string;
  client: { companyName: string };
}

export interface VehicleAlert {
  id: string;
  vehicleCode: string;
  notes: string | null;
}

export interface DriverAlert {
  id: string;
  fullName: string;
}

export interface SystemAlerts {
  expiringContracts: ExpiringContract[];
  vehiclesInMaintenance: VehicleAlert[];
  suspendedDrivers: DriverAlert[];
  inactiveDrivers: DriverAlert[];
}
