export interface JwtAccessPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  type: 'access';
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}
