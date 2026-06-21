export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';

export type ContractType = 'PER_TRIP' | 'MONTHLY';

export interface Contract {
  id: string;
  contractNumber: string;
  clientId: string;
  title: string;
  description: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  price: string | null;
  currency: string;
  contractType: ContractType;
  startDate: string | null;
  endDate: string | null;
  status: ContractStatus;
  assignedVehicleId: string | null;
  assignedDriverId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  client: {
    id: string;
    companyName: string;
  };
  assignedVehicle?: {
    id: string;
    vehicleCode: string;
  } | null;
  assignedDriver?: {
    id: string;
    fullName: string;
    driverCode: string;
  } | null;
}

export interface ContractsQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: ContractStatus;
  clientId?: string;
}

export interface CreateContractPayload {
  contractNumber: string;
  clientId: string;
  title: string;
  description?: string;
  fromLocation?: string;
  toLocation?: string;
  price?: number;
  currency?: string;
  contractType?: ContractType;
  startDate?: string;
  endDate?: string;
  status?: ContractStatus;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  notes?: string;
}

export interface UpdateContractPayload {
  contractNumber?: string;
  clientId?: string;
  title?: string;
  description?: string;
  fromLocation?: string;
  toLocation?: string;
  price?: number;
  currency?: string;
  contractType?: ContractType;
  startDate?: string;
  endDate?: string;
  status?: ContractStatus;
  assignedVehicleId?: string;
  assignedDriverId?: string;
  notes?: string;
}

export interface PaginatedContractsResponse {
  items: Contract[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
