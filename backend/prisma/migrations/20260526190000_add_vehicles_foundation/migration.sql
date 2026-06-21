-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('TRAILER', 'JUMBO');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'IN_TRIP', 'IN_MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "VehiclePlateRole" AS ENUM ('TRUCK_HEAD', 'TRAILER_UNIT', 'JUMBO');

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL,
    "vehicle_code" VARCHAR(100) NOT NULL,
    "type" "VehicleType" NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_driver_id" UUID,
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "production_year" INTEGER,
    "capacity_kg" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_plates" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "role" "VehiclePlateRole" NOT NULL,
    "plate_number" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicle_plates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_status_histories" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "old_status" "VehicleStatus",
    "new_status" "VehicleStatus" NOT NULL,
    "changed_by" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "vehicle_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vehicles_vehicle_code_idx" ON "vehicles"("vehicle_code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicle_code_active_key" ON "vehicles"("vehicle_code") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE INDEX "vehicles_type_idx" ON "vehicles"("type");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE INDEX "vehicles_current_driver_id_idx" ON "vehicles"("current_driver_id");

-- CreateIndex
CREATE INDEX "vehicles_created_at_idx" ON "vehicles"("created_at");

-- CreateIndex
CREATE INDEX "vehicles_deleted_at_idx" ON "vehicles"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_plates_vehicle_id_role_key" ON "vehicle_plates"("vehicle_id", "role");

-- CreateIndex
CREATE INDEX "vehicle_plates_vehicle_id_idx" ON "vehicle_plates"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_plates_plate_number_idx" ON "vehicle_plates"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_plates_plate_number_active_key" ON "vehicle_plates"("plate_number") WHERE "deleted_at" IS NULL;

-- CreateIndex
CREATE INDEX "vehicle_plates_deleted_at_idx" ON "vehicle_plates"("deleted_at");

-- CreateIndex
CREATE INDEX "vehicle_status_histories_vehicle_id_idx" ON "vehicle_status_histories"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_status_histories_new_status_idx" ON "vehicle_status_histories"("new_status");

-- CreateIndex
CREATE INDEX "vehicle_status_histories_changed_by_idx" ON "vehicle_status_histories"("changed_by");

-- CreateIndex
CREATE INDEX "vehicle_status_histories_changed_at_idx" ON "vehicle_status_histories"("changed_at");

-- AddForeignKey
ALTER TABLE "vehicle_plates" ADD CONSTRAINT "vehicle_plates_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_status_histories" ADD CONSTRAINT "vehicle_status_histories_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_status_histories" ADD CONSTRAINT "vehicle_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
