-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AssignmentReason" AS ENUM ('ASSIGNMENT', 'TRANSFER', 'UNASSIGNMENT');

-- CreateTable
CREATE TABLE "sectors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_sectors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sector_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vehicle_id" UUID NOT NULL,
    "sub_sector_id" UUID NOT NULL,
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassigned_at" TIMESTAMPTZ,
    "notes" TEXT,

    CONSTRAINT "vehicle_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_assignment_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vehicle_id" UUID NOT NULL,
    "sub_sector_id" UUID,
    "assigned_at" TIMESTAMPTZ NOT NULL,
    "unassigned_at" TIMESTAMPTZ NOT NULL,
    "transferred_from_sub_sector_id" UUID,
    "reason" "AssignmentReason" NOT NULL,
    "notes" TEXT,
    "changed_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_assignment_histories_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Trip sector columns
ALTER TABLE "trips" ADD COLUMN "from_sector_id" UUID;
ALTER TABLE "trips" ADD COLUMN "to_sector_id" UUID;

-- CreateIndex: sectors
CREATE UNIQUE INDEX "sectors_name_key" ON "sectors"("name");
CREATE UNIQUE INDEX "sectors_code_key" ON "sectors"("code");
CREATE INDEX "sectors_status_idx" ON "sectors"("status");
CREATE INDEX "sectors_created_at_idx" ON "sectors"("created_at");

-- CreateIndex: sub_sectors
CREATE UNIQUE INDEX "sub_sectors_sector_id_name_key" ON "sub_sectors"("sector_id", "name");
CREATE UNIQUE INDEX "sub_sectors_sector_id_code_key" ON "sub_sectors"("sector_id", "code");
CREATE INDEX "sub_sectors_sector_id_idx" ON "sub_sectors"("sector_id");
CREATE INDEX "sub_sectors_status_idx" ON "sub_sectors"("status");

-- CreateIndex: vehicle_assignments
CREATE INDEX "vehicle_assignments_vehicle_id_idx" ON "vehicle_assignments"("vehicle_id");
CREATE INDEX "vehicle_assignments_sub_sector_id_idx" ON "vehicle_assignments"("sub_sector_id");
CREATE INDEX "vehicle_assignments_assigned_at_idx" ON "vehicle_assignments"("assigned_at");
CREATE INDEX "vehicle_assignments_unassigned_at_idx" ON "vehicle_assignments"("unassigned_at");
CREATE INDEX "vehicle_assignments_sub_sector_id_unassigned_at_idx" ON "vehicle_assignments"("sub_sector_id", "unassigned_at");
CREATE UNIQUE INDEX "idx_one_active_assignment" ON "vehicle_assignments"("vehicle_id") WHERE unassigned_at IS NULL;

-- CreateIndex: vehicle_assignment_histories
CREATE INDEX "vehicle_assignment_histories_vehicle_id_idx" ON "vehicle_assignment_histories"("vehicle_id");
CREATE INDEX "vehicle_assignment_histories_sub_sector_id_idx" ON "vehicle_assignment_histories"("sub_sector_id");
CREATE INDEX "vehicle_assignment_histories_reason_idx" ON "vehicle_assignment_histories"("reason");
CREATE INDEX "vehicle_assignment_histories_created_at_idx" ON "vehicle_assignment_histories"("created_at");

-- CreateIndex: trips sector columns
CREATE INDEX "trips_from_sector_id_idx" ON "trips"("from_sector_id");
CREATE INDEX "trips_to_sector_id_idx" ON "trips"("to_sector_id");

-- AddForeignKeys: sub_sectors
ALTER TABLE "sub_sectors" ADD CONSTRAINT "sub_sectors_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKeys: vehicle_assignments
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicle_assignments" ADD CONSTRAINT "vehicle_assignments_sub_sector_id_fkey" FOREIGN KEY ("sub_sector_id") REFERENCES "sub_sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKeys: vehicle_assignment_histories
ALTER TABLE "vehicle_assignment_histories" ADD CONSTRAINT "vehicle_assignment_histories_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicle_assignment_histories" ADD CONSTRAINT "vehicle_assignment_histories_sub_sector_id_fkey" FOREIGN KEY ("sub_sector_id") REFERENCES "sub_sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_assignment_histories" ADD CONSTRAINT "vehicle_assignment_histories_transferred_from_sub_sector_id_fkey" FOREIGN KEY ("transferred_from_sub_sector_id") REFERENCES "sub_sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_assignment_histories" ADD CONSTRAINT "vehicle_assignment_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKeys: trips
ALTER TABLE "trips" ADD CONSTRAINT "trips_from_sector_id_fkey" FOREIGN KEY ("from_sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_to_sector_id_fkey" FOREIGN KEY ("to_sector_id") REFERENCES "sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
