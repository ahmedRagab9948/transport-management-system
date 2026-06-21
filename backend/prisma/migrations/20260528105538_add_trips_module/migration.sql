-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL,
    "trip_number" VARCHAR(100) NOT NULL,
    "client_id" UUID,
    "vehicle_id" UUID NOT NULL,
    "driver_id" UUID NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'PENDING',
    "from_location" VARCHAR(500) NOT NULL,
    "to_location" VARCHAR(500) NOT NULL,
    "cargo_description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "price" DECIMAL(12,2),
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_status_histories" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "old_status" "TripStatus",
    "new_status" "TripStatus" NOT NULL,
    "changed_by" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "trip_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trips_trip_number_idx" ON "trips"("trip_number");

-- CreateIndex
CREATE INDEX "trips_client_id_idx" ON "trips"("client_id");

-- CreateIndex
CREATE INDEX "trips_vehicle_id_idx" ON "trips"("vehicle_id");

-- CreateIndex
CREATE INDEX "trips_driver_id_idx" ON "trips"("driver_id");

-- CreateIndex
CREATE INDEX "trips_status_idx" ON "trips"("status");

-- CreateIndex
CREATE INDEX "trips_start_date_idx" ON "trips"("start_date");

-- CreateIndex
CREATE INDEX "trips_end_date_idx" ON "trips"("end_date");

-- CreateIndex
CREATE INDEX "trips_created_by_idx" ON "trips"("created_by");

-- CreateIndex
CREATE INDEX "trips_created_at_idx" ON "trips"("created_at");

-- CreateIndex
CREATE INDEX "trips_deleted_at_idx" ON "trips"("deleted_at");

-- CreateIndex
CREATE INDEX "trip_status_histories_trip_id_idx" ON "trip_status_histories"("trip_id");

-- CreateIndex
CREATE INDEX "trip_status_histories_new_status_idx" ON "trip_status_histories"("new_status");

-- CreateIndex
CREATE INDEX "trip_status_histories_changed_by_idx" ON "trip_status_histories"("changed_by");

-- CreateIndex
CREATE INDEX "trip_status_histories_changed_at_idx" ON "trip_status_histories"("changed_at");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_status_histories" ADD CONSTRAINT "trip_status_histories_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_status_histories" ADD CONSTRAINT "trip_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
