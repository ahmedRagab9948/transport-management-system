-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('ACTIVE', 'IN_TRIP', 'INACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "drivers" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "national_id" VARCHAR(100) NOT NULL,
    "license_number" VARCHAR(100) NOT NULL,
    "license_expiry" TIMESTAMP(3) NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_vehicle_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_status_histories" (
    "id" UUID NOT NULL,
    "driver_id" UUID NOT NULL,
    "old_status" "DriverStatus",
    "new_status" "DriverStatus" NOT NULL,
    "changed_by" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "driver_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "drivers_full_name_idx" ON "drivers"("full_name");

-- CreateIndex
CREATE INDEX "drivers_phone_idx" ON "drivers"("phone");

-- CreateIndex
CREATE INDEX "drivers_national_id_idx" ON "drivers"("national_id");

-- CreateIndex
CREATE INDEX "drivers_status_idx" ON "drivers"("status");

-- CreateIndex
CREATE INDEX "drivers_license_number_idx" ON "drivers"("license_number");

-- CreateIndex
CREATE INDEX "drivers_created_at_idx" ON "drivers"("created_at");

-- CreateIndex
CREATE INDEX "drivers_deleted_at_idx" ON "drivers"("deleted_at");

-- CreateIndex
CREATE INDEX "driver_status_histories_driver_id_idx" ON "driver_status_histories"("driver_id");

-- CreateIndex
CREATE INDEX "driver_status_histories_new_status_idx" ON "driver_status_histories"("new_status");

-- CreateIndex
CREATE INDEX "driver_status_histories_changed_by_idx" ON "driver_status_histories"("changed_by");

-- CreateIndex
CREATE INDEX "driver_status_histories_changed_at_idx" ON "driver_status_histories"("changed_at");

-- AddForeignKey
ALTER TABLE "driver_status_histories" ADD CONSTRAINT "driver_status_histories_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_status_histories" ADD CONSTRAINT "driver_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
