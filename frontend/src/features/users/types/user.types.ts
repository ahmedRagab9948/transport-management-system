export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: { id: string; name: string };
  isActive: boolean;
  otpEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface UsersQueryParams {
  page: number;
  limit: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  roleId: string;
  isActive?: boolean;
  otpEnabled?: boolean;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  isActive?: boolean;
  otpEnabled?: boolean;
}

export interface PaginatedUsersResponse {
  items: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UsersSummary {
  total: number;
  active: number;
  inactive: number;
}
