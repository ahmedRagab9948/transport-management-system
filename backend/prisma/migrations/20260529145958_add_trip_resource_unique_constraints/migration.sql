-- CreateIndex
CREATE UNIQUE INDEX "idx_trip_single_active_vehicle" ON "trips"("vehicle_id", "status") WHERE "status" IN ('ASSIGNED', 'IN_PROGRESS') AND "deleted_at" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "idx_trip_single_active_driver" ON "trips"("driver_id", "status") WHERE "status" IN ('ASSIGNED', 'IN_PROGRESS') AND "deleted_at" IS NULL;

-- CreateIndex
CREATE INDEX "trips_start_date_end_date_idx" ON "trips"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "trips_actual_start_date_actual_end_date_idx" ON "trips"("actual_start_date", "actual_end_date");
