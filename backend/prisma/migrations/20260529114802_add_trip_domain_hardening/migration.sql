-- AlterTable
ALTER TABLE "trip_status_histories" ADD COLUMN     "reason_code" VARCHAR(50);

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "actual_start_date" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "trip_status_histories_reason_code_idx" ON "trip_status_histories"("reason_code");
