/*
  # Enforce one-officer-one-dog rule at the database level

  ## Summary
  Adds a UNIQUE constraint on dog_officer(officer_id) to enforce the business rule
  "one mission officer may be assigned to at most one dog globally" at the database level.
  Previously this rule was enforced only in application code (assignmentValidation.ts),
  which left a gap: direct database access could silently violate it.

  ## Changes

  ### 1. Duplicate detection and cleanup
  - Queries dog_officer grouped by officer_id to find any officers assigned to more than one dog.
  - For each duplicate group, retains the row with the earliest assigned_at timestamp (the original
    assignment) and deletes all later rows.
  - One duplicate was found during QA:
      officer_id : cbfc0945-2fdf-4b9d-addc-4a595173817b
      kept row   : d9312632-bed1-457c-ac7b-97fd0b4f8ed4  (dog 309ab615, oldest)
      removed row: d358191a-780f-413d-840a-fbbf72ff82dd  (dog 53b83eca, newer duplicate)

  ### 2. New constraint
  - UNIQUE (officer_id) on dog_officer — constraint name: unique_officer_in_dog_officer
  - Mirrors the existing unique_dog_in_dog_officer constraint on (dog_id), making both
    sides of the one-to-one relationship enforced at the DB level.

  ## Security
  - No RLS changes required — existing policies on dog_officer remain intact.

  ## Compatibility
  - No changes to application code required. The app-layer check in assignmentValidation.ts
    already enforces this rule correctly; this migration adds the DB-level safety net.
  - Backward compatible: null officer_id values are not affected (UNIQUE constraints in
    Postgres allow multiple NULLs).
*/

DO $$
DECLARE
  dup RECORD;
  kept_id uuid;
BEGIN
  FOR dup IN
    SELECT officer_id
    FROM dog_officer
    GROUP BY officer_id
    HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO kept_id
    FROM dog_officer
    WHERE officer_id = dup.officer_id
    ORDER BY assigned_at ASC
    LIMIT 1;

    DELETE FROM dog_officer
    WHERE officer_id = dup.officer_id
      AND id <> kept_id;

    RAISE NOTICE 'Duplicate officer_id % — removed extra rows, kept id %', dup.officer_id, kept_id;
  END LOOP;
END $$;

ALTER TABLE dog_officer
  ADD CONSTRAINT unique_officer_in_dog_officer UNIQUE (officer_id);
