export { AuthModule } from './auth.module';
export { CurrentUser } from './decorators/current-user.decorator';
export { RequirePermissions, PERMISSIONS_KEY } from './decorators/require-permissions.decorator';
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { PermissionsGuard } from './guards/permissions.guard';
export type { AuthenticatedUser } from './interfaces/jwt-payload.interface';
