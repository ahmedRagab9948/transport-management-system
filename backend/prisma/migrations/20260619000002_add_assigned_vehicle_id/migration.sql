-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "assigned_vehicle_id" UUID;

-- CreateIndex
CREATE INDEX "contracts_assigned_vehicle_id_idx" ON "contracts"("assigned_vehicle_id");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_assigned_vehicle_id_fkey" FOREIGN KEY ("assigned_vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;