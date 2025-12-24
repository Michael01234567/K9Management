/*
  # Enforce One Dog Per Officer Constraint

  1. Changes
    - Clean up existing data: Keep only the most recently assigned dog for each officer
    - Drop the existing UNIQUE constraint on (dog_id, officer_id)
    - Add new UNIQUE constraint on officer_id to ensure each officer has only one dog

  2. Data Cleanup
    - For officers with multiple dogs, keep only the most recent assignment
    - Delete older assignments

  3. Security
    - No changes to RLS policies

  4. Notes
    - This ensures each mission officer can only be assigned to one dog
    - Dogs can still be assigned to multiple officers if needed
    - The cleanup preserves the most recent assignment for each officer
*/

-- First, identify and delete all but the most recent assignment for each officer
DELETE FROM dog_officer
WHERE id NOT IN (
  SELECT DISTINCT ON (officer_id) id
  FROM dog_officer
  ORDER BY officer_id, assigned_at DESC
);

-- Drop the existing composite unique constraint
ALTER TABLE dog_officer DROP CONSTRAINT IF EXISTS dog_officer_dog_id_officer_id_key;

-- Add unique constraint on officer_id to enforce one dog per officer
ALTER TABLE dog_officer ADD CONSTRAINT dog_officer_officer_id_unique UNIQUE (officer_id);

-- Keep the index on dog_id for query performance
-- The index on officer_id is now automatically created by the UNIQUE constraint
DROP INDEX IF EXISTS idx_dog_officer_officer_id;
