/*
  # Update Dogs Table to Use Location Foreign Key

  ## Overview
  This migration updates the dogs table to use a location_id foreign key instead
  of storing location names as text, providing better data integrity and consistency.

  ## 1. Changes

  ### dogs table
  - Add `location_id` (uuid, foreign key) - References locations table
  - Keep existing `location` (text) column temporarily for data migration
  - Migrate data from location text to location_id references
  - Remove old location text column after migration

  ## 2. Data Migration Steps
  1. Add new location_id column
  2. Populate location_id by matching location names to locations table
  3. Keep the old location column for backward compatibility (can be removed later if needed)

  ## 3. Important Notes
  - Dogs with unmatched locations will have NULL location_id
  - The old location text column is preserved to avoid data loss
  - Foreign key constraint ensures referential integrity
*/

-- ============================================
-- ADD LOCATION_ID COLUMN
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'location_id'
  ) THEN
    ALTER TABLE dogs ADD COLUMN location_id uuid REFERENCES locations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- MIGRATE DATA FROM LOCATION TEXT TO LOCATION_ID
-- ============================================

UPDATE dogs
SET location_id = locations.id
FROM locations
WHERE dogs.location = locations.name
AND dogs.location_id IS NULL;

-- ============================================
-- CREATE INDEX FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dogs_location_id ON dogs(location_id);