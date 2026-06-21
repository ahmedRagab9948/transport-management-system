-- Migration: 20260611000003_safe_driver_code_constraint
-- Fixes: Unsafe single-step NOT NULL in 20260611000001_add_driver_code
--         Full unique constraint incompatible with soft delete
--
-- Root cause: Previous migration added driver_code as:
--   ALTER TABLE "drivers" ADD COLUMN "driver_code" VARCHAR(100) NOT NULL;
-- This fails on any database with existing driver rows because PostgreSQL
-- cannot add a NOT NULL column without a DEFAULT value to a non-empty table.
--
-- Fix strategy (5-phase safe approach):
--   Phase 1: Drop NOT NULL (revert to nullable)
--   Phase 2: Backfill any hypothetically NULL rows with deterministic unique values
--   Phase 3: Validate no NULLs remain
--   Phase 4: Re-apply NOT NULL (safe because all rows now have values)
--   Phase 5: Drop full unique constraint, create partial unique index
--            compatible with soft-delete (WHERE deleted_at IS NULL)

-- +--------------------------------------------------------------------------+
-- | PHASE 1 — Drop NOT NULL to allow safe backfill                           |
-- +--------------------------------------------------------------------------+
ALTER TABLE "drivers" ALTER COLUMN "driver_code" DROP NOT NULL;

-- +--------------------------------------------------------------------------+
-- | PHASE 2 — Backfill any existing NULL rows with deterministic values     |
-- |           Uses UUID primary key as base for guaranteed uniqueness:       |
-- |           DRV-{uuid} format avoids collisions with user-assigned codes   |
-- +--------------------------------------------------------------------------+
UPDATE "drivers"
SET "driver_code" = 'DRV-' || "id"
WHERE "driver_code" IS NULL;

-- +--------------------------------------------------------------------------+
-- | PHASE 3 — Validate no NULL values remain                                |
-- |           The SET NOT NULL in Phase 4 will throw an error if any         |
-- |           NULL row exists, providing the validation guard.               |
-- +--------------------------------------------------------------------------+

-- +--------------------------------------------------------------------------+
-- | PHASE 4 — Safely set NOT NULL (all rows now have values)                |
-- +--------------------------------------------------------------------------+
ALTER TABLE "drivers" ALTER COLUMN "driver_code" SET NOT NULL;

-- +--------------------------------------------------------------------------+
-- | PHASE 5 — Replace full unique constraint with partial unique index      |
-- |           Allows soft-deleted driver codes to be reused, consistent      |
-- |           with Vehicle.vehicleCode and Trip.tripNumber patterns.         |
-- +--------------------------------------------------------------------------+
DROP INDEX IF EXISTS "drivers_driver_code_key";
CREATE UNIQUE INDEX "drivers_driver_code_key" ON "drivers"("driver_code") WHERE "deleted_at" IS NULL;
