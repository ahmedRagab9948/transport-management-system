-- Add missing columns to trips
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "waiting_started_at" TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "waiting_ended_at" TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "contract_id" UUID;

-- Add missing index on contract_id
CREATE INDEX IF NOT EXISTS "trips_contract_id_idx" ON "trips" ("contract_id");

-- Drop partial unique indexes referencing old IN_PROGRESS value
DROP INDEX IF EXISTS "idx_trip_single_active_vehicle";
DROP INDEX IF EXISTS "idx_trip_single_active_driver";

-- Create new enum type with all granular values (replacing IN_PROGRESS)
CREATE TYPE "TripStatus_new" AS ENUM ('DRAFT', 'PENDING', 'ASSIGNED', 'DRIVER_CONFIRMED', 'LOADING', 'ON_ROUTE', 'WAITING', 'UNLOADING', 'COMPLETED', 'CANCELLED');

-- Alter trips.status
ALTER TABLE "trips" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "trips" ALTER COLUMN "status" TYPE "TripStatus_new" USING ("status"::text::"TripStatus_new");
ALTER TABLE "trips" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"TripStatus_new";

-- Alter trip_status_histories columns
ALTER TABLE "trip_status_histories" ALTER COLUMN "old_status" TYPE "TripStatus_new" USING ("old_status"::text::"TripStatus_new");
ALTER TABLE "trip_status_histories" ALTER COLUMN "new_status" TYPE "TripStatus_new" USING ("new_status"::text::"TripStatus_new");

-- Drop old type and rename new
DROP TYPE IF EXISTS "TripStatus" CASCADE;
ALTER TYPE "TripStatus_new" RENAME TO "TripStatus";

-- Recreate partial unique indexes with granular active statuses
CREATE UNIQUE INDEX "idx_trip_single_active_vehicle" ON "trips" ("vehicle_id", "status") WHERE status IN ('ASSIGNED', 'DRIVER_CONFIRMED', 'LOADING', 'ON_ROUTE', 'WAITING', 'UNLOADING') AND deleted_at IS NULL;
CREATE UNIQUE INDEX "idx_trip_single_active_driver" ON "trips" ("driver_id", "status") WHERE status IN ('ASSIGNED', 'DRIVER_CONFIRMED', 'LOADING', 'ON_ROUTE', 'WAITING', 'UNLOADING') AND deleted_at IS NULL;
