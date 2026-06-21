-- AlterTable: Add driverCode to drivers
ALTER TABLE "drivers" ADD COLUMN "driver_code" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "drivers_driver_code_key" ON "drivers"("driver_code");