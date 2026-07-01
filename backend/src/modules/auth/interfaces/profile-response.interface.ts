export interface ProfileResponse {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phone: string | null;
  avatar: string | null;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  preferredLanguage: string;
  timezone: string | null;
  mfaEnabled: boolean;
  mfaVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  permissions: Record<string, string[]>;
  profileUpdatedAt: Date | null;
  passwordChangedAt: Date | null;
}
