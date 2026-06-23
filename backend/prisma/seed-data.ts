/**
 * Canonical roles and permissions for TMS RBAC seeding.
 * Permission keys use SCREAMING_SNAKE_CASE per project conventions.
 */

export const ROLES = {
  ADMIN: {
    name: 'admin',
    description: 'Full system access including user and permission management',
  },
  DISPATCHER: {
    name: 'dispatcher',
    description: 'Operational staff — trip and fleet coordination',
  },
  MANAGER: {
    name: 'manager',
    description: 'Supervisory access with reporting and oversight',
  },
  VIEWER: {
    name: 'viewer',
    description: 'Read-only access to operational data',
  },
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES]['name'];

/** Auth & admin permissions (implemented in this phase). */
export const AUTH_PERMISSIONS = [
  { key: 'VIEW_USERS', description: 'View employee user accounts' },
  { key: 'CREATE_USER', description: 'Create employee user accounts' },
  { key: 'UPDATE_USER', description: 'Update employee user accounts' },
  { key: 'DELETE_USER', description: 'Soft-delete employee user accounts' },
  { key: 'VIEW_ROLES', description: 'View roles and their permission assignments' },
  { key: 'MANAGE_ROLES', description: 'Create/update roles and assign permissions' },
  { key: 'VIEW_PERMISSIONS', description: 'View permission catalog' },
  { key: 'VIEW_AUDIT_LOGS', description: 'View system audit logs' },
  { key: 'VIEW_NOTIFICATIONS', description: 'View in-app notifications' },
] as const;

/**
 * Domain permissions reserved for upcoming modules.
 * Seeded now so RBAC stays stable when trips/vehicles/drivers are added.
 */
export const DOMAIN_PERMISSIONS = [
  { key: 'VIEW_TRIPS', description: 'View trips' },
  { key: 'CREATE_TRIP', description: 'Create trips' },
  { key: 'UPDATE_TRIP', description: 'Update trips' },
  { key: 'DELETE_TRIP', description: 'Delete trips (admin only per business rules)' },
  { key: 'VIEW_VEHICLES', description: 'View vehicles' },
  { key: 'CREATE_VEHICLE', description: 'Create vehicles' },
  { key: 'UPDATE_VEHICLE', description: 'Update vehicles' },
  { key: 'DELETE_VEHICLE', description: 'Soft-delete vehicles' },
  { key: 'CHANGE_VEHICLE_STATUS', description: 'Change vehicle operational status' },
  { key: 'VIEW_DRIVERS', description: 'View drivers' },
  { key: 'CREATE_DRIVER', description: 'Create drivers' },
  { key: 'UPDATE_DRIVER', description: 'Update drivers' },
  { key: 'DELETE_DRIVER', description: 'Soft-delete drivers' },
  { key: 'CHANGE_DRIVER_STATUS', description: 'Change driver operational status' },
  { key: 'VIEW_CLIENTS', description: 'View clients' },
  { key: 'CREATE_CLIENT', description: 'Create clients' },
  { key: 'UPDATE_CLIENT', description: 'Update clients' },
  { key: 'DELETE_CLIENT', description: 'Soft-delete clients' },
  { key: 'VIEW_CONTRACTS', description: 'View contracts' },
  { key: 'CREATE_CONTRACT', description: 'Create contracts' },
  { key: 'UPDATE_CONTRACT', description: 'Update contracts' },
  { key: 'DELETE_CONTRACT', description: 'Soft-delete contracts' },
  { key: 'VIEW_REPORTS', description: 'View reports and analytics' },
  { key: 'VIEW_DISPATCH_BOARD', description: 'View dispatch board and real-time trip statuses' },
  { key: 'DISPATCH_ASSIGN', description: 'Assign drivers/vehicles to trips from dispatch board' },
  { key: 'DISPATCH_TRANSITION', description: 'Transition trip status from dispatch board' },
  { key: 'DISPATCH_MANAGE', description: 'Manage dispatch board settings and resources' },
  { key: 'CONFIRM_DRIVER_ON_BEHALF', description: 'Confirm driver status on behalf of the driver' },
] as const;

export const ALL_PERMISSIONS = [...AUTH_PERMISSIONS, ...DOMAIN_PERMISSIONS];

/** Role → permission keys matrix */
export const ROLE_PERMISSION_MATRIX: Record<RoleName, readonly string[]> = {
  [ROLES.ADMIN.name]: ALL_PERMISSIONS.map((p) => p.key),
  [ROLES.DISPATCHER.name]: [
    'VIEW_TRIPS',
    'CREATE_TRIP',
    'UPDATE_TRIP',
    'VIEW_NOTIFICATIONS',
    'VIEW_VEHICLES',
    'CREATE_VEHICLE',
    'UPDATE_VEHICLE',
    'CHANGE_VEHICLE_STATUS',
    'VIEW_DRIVERS',
    'CREATE_DRIVER',
    'UPDATE_DRIVER',
    'CHANGE_DRIVER_STATUS',
    'CREATE_CLIENT',
    'UPDATE_CLIENT',
    'VIEW_CLIENTS',
    'VIEW_CONTRACTS',
    'CREATE_CONTRACT',
    'UPDATE_CONTRACT',
    'VIEW_DISPATCH_BOARD',
    'DISPATCH_ASSIGN',
    'DISPATCH_TRANSITION',
    'DISPATCH_MANAGE',
    'CONFIRM_DRIVER_ON_BEHALF',
  ],
  [ROLES.MANAGER.name]: [
    'VIEW_TRIPS',
    'VIEW_VEHICLES',
    'CREATE_VEHICLE',
    'UPDATE_VEHICLE',
    'CHANGE_VEHICLE_STATUS',
    'VIEW_DRIVERS',
    'CREATE_DRIVER',
    'UPDATE_DRIVER',
    'CHANGE_DRIVER_STATUS',
    'CREATE_CLIENT',
    'UPDATE_CLIENT',
    'VIEW_CLIENTS',
    'VIEW_CONTRACTS',
    'CREATE_CONTRACT',
    'UPDATE_CONTRACT',
    'VIEW_REPORTS',
    'VIEW_DISPATCH_BOARD',
    'VIEW_NOTIFICATIONS',
    'CONFIRM_DRIVER_ON_BEHALF',
  ],
  [ROLES.VIEWER.name]: [
    'VIEW_TRIPS',
    'VIEW_VEHICLES',
    'VIEW_DRIVERS',
    'VIEW_CLIENTS',
    'VIEW_CONTRACTS',
    'VIEW_REPORTS',
  ],
};
