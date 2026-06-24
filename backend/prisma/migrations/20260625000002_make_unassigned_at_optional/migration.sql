-- Make unassigned_at optional in vehicle_assignment_histories
-- to allow recording ASSIGNMENT events without an unassign timestamp.

ALTER TABLE vehicle_assignment_histories
ALTER COLUMN unassigned_at DROP NOT NULL;
