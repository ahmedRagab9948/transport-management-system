import type { ClientStatus } from '@tms/shared';

export type { ClientStatus };

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxNumber: string | null;
  notes: string | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClientsQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: ClientStatus;
}

export interface CreateClientPayload {
  companyName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface UpdateClientPayload {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface PaginatedClientsResponse {
  items: Client[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
