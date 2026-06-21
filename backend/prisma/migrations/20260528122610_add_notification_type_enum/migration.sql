-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRIP_CREATED', 'TRIP_ASSIGNED', 'TRIP_STATUS_CHANGED', 'TRIP_COMPLETED', 'TRIP_CANCELLED', 'VEHICLE_MAINTENANCE', 'VEHICLE_OUT_OF_SERVICE', 'DRIVER_SUSPENDED', 'DRIVER_INACTIVE', 'CONTRACT_EXPIRING', 'CONTRACT_COMPLETED');

-- AlterTable: add archived_at, cast existing type values to enum
ALTER TABLE "notifications" ADD COLUMN "archived_at" TIMESTAMP(3);
ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType" USING ("type"::"NotificationType");
ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'TRIP_CREATED';

-- CreateIndex
CREATE INDEX "notifications_archived_at_idx" ON "notifications"("archived_at");
