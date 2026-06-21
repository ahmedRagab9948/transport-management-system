-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "assigned_driver_id" UUID;

-- CreateIndex
CREATE INDEX "vehicles_assigned_driver_id_idx" ON "vehicles"("assigned_driver_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
