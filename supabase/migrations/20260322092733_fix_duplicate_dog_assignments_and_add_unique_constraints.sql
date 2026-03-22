/*
  # Fix Duplicate Dog Assignments and Add Unique Constraints

  ## Summary
  This migration resolves a critical data integrity issue discovered during QA.
  Five dogs each had two rows in the `dog_officer` table, violating the one-dog-one-officer
  business rule. The `dog_handler` table was already clean (no duplicates found).

  ## Changes

  ### 1. Clean Duplicate dog_officer Rows
  For each dog with duplicate officer assignments, keep the most operationally relevant
  officer (determined by mission frequency and recency) and delete the stale duplicate.

  Duplicates removed:
  - Thunder: Remove Abdullah Al Suwaidi (deda7d80), keep Ahmed Al Mansoori (4088bcc1)
  - Bella:   Remove Rashid Al Nuaimi (a88a66c9), keep Omar Al Ketbi (cbfc0945)
  - Zara:    Remove Sultan Al Ameri (a3f3901f), keep Omar Al Ketbi (cbfc0945)
  - Rex:     Remove Khalid Al Mazrouei (de3058c2), keep Hassan Al Zaabi (2027da5a)
  - Duke:    Remove Ali Al Qubaisi (619aff79), keep Abdullah Al Suwaidi (deda7d80)

  ### 2. Add UNIQUE Constraints
  - `dog_handler(dog_id)`: Enforces one handler per dog at the database level
  - `dog_officer(dog_id)`: Enforces one officer per dog at the database level

  These constraints ensure UI-level validation cannot be bypassed via direct DB operations.

  ### Security
  No RLS changes — existing policies remain intact.

  ### Important Notes
  1. Constraint names are prefixed to avoid collision with any prior attempts.
  2. IF NOT EXISTS is used on constraint creation to make migration idempotent.
  3. Duplicate deletion uses specific officer_id values to be precise and safe.
*/

-- Step 1: Delete duplicate dog_officer rows (keep one authoritative record per dog)

-- Thunder: remove Abdullah Al Suwaidi, keep Ahmed Al Mansoori
DELETE FROM dog_officer
WHERE dog_id = '2f08f9a3-0173-4f47-b63f-040dc476e228'
  AND officer_id = 'deda7d80-7a79-47a0-9957-b2474a78da41';

-- Bella: remove Rashid Al Nuaimi, keep Omar Al Ketbi
DELETE FROM dog_officer
WHERE dog_id = '309ab615-4df5-4b5f-8885-eda3004593b7'
  AND officer_id = 'a88a66c9-97a5-402a-b9c5-35611cfdb062';

-- Zara: remove Sultan Al Ameri, keep Omar Al Ketbi
DELETE FROM dog_officer
WHERE dog_id = '53b83eca-f276-411b-b6bd-5e2cf2a4dc0b'
  AND officer_id = 'a3f3901f-bd0a-40ae-9665-39e47e0d0080';

-- Rex: remove Khalid Al Mazrouei, keep Hassan Al Zaabi
DELETE FROM dog_officer
WHERE dog_id = '5ced1b11-5bd9-4282-bd1a-241ec820a8db'
  AND officer_id = 'de3058c2-0e8c-444b-8029-5a119095e27f';

-- Duke: remove Ali Al Qubaisi, keep Abdullah Al Suwaidi
DELETE FROM dog_officer
WHERE dog_id = '669e4313-8571-4ce5-9dca-c995a0068b66'
  AND officer_id = '619aff79-ee1f-48c1-b674-44d0fbf3db2e';

-- Step 2: Add UNIQUE constraints to enforce one-dog-one-handler and one-dog-one-officer rules

-- dog_handler: one dog may only have one handler
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_dog_in_dog_handler'
      AND conrelid = 'dog_handler'::regclass
  ) THEN
    ALTER TABLE dog_handler ADD CONSTRAINT unique_dog_in_dog_handler UNIQUE (dog_id);
  END IF;
END $$;

-- dog_officer: one dog may only have one officer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_dog_in_dog_officer'
      AND conrelid = 'dog_officer'::regclass
  ) THEN
    ALTER TABLE dog_officer ADD CONSTRAINT unique_dog_in_dog_officer UNIQUE (dog_id);
  END IF;
END $$;
