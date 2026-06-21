-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PER_TRIP', 'MONTHLY');

-- AlterEnum
BEGIN;
CREATE TYPE "ContractStatus_new" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');
ALTER TABLE "public"."contracts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "contracts" ALTER COLUMN "status" TYPE "ContractStatus_new" USING ("status"::text::"ContractStatus_new");
ALTER TYPE "ContractStatus" RENAME TO "ContractStatus_old";
ALTER TYPE "ContractStatus_new" RENAME TO "ContractStatus";
DROP TYPE "public"."ContractStatus_old";
ALTER TABLE "contracts" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "contract_type" "ContractType" NOT NULL DEFAULT 'PER_TRIP';