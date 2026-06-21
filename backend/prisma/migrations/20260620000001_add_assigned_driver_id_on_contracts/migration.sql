-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "assigned_driver_id" UUID;

-- CreateIndex
CREATE INDEX "contracts_assigned_driver_id_idx" ON "contracts"("assigned_driver_id");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
