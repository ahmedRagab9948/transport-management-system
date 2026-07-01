export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: { id: string; name: string };
  isActive: boolean;
  otpEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
