-- AlterTable: Add unique constraint on tripNumber (non-deleted)
CREATE UNIQUE INDEX "trips_trip_number_key" ON "trips"("trip_number") WHERE deleted_at IS NULL;

-- AlterTable: Add unique constraint on vehicleCode (non-deleted)
CREATE UNIQUE INDEX "vehicles_vehicle_code_key" ON "vehicles"("vehicle_code") WHERE deleted_at IS NULL;