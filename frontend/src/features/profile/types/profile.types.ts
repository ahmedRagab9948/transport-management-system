export interface Profile {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string | null;
  avatar: string | null;
  role: { id: string; name: string };
  isActive: boolean;
  preferredLanguage: string;
  timezone: string | null;
  mfaEnabled: boolean;
  mfaVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  profileUpdatedAt: string | null;
  passwordChangedAt: string | null;
  permissions: Record<string, string[]>;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatar?: string;
  preferredLanguage?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
