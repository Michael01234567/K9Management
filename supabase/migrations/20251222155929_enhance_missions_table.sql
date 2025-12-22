/*
  # Enhance Missions Table

  1. Changes to `missions` table
    - Add 'Completed' to status enum values
    - Add `explosive_teams` (jsonb) - Array of {dog_id, handler_id} pairs for explosive dogs
    - Add `narcotic_teams` (jsonb) - Array of {dog_id, handler_id} pairs for narcotic dogs
    - Add `items_with_quantities` (jsonb) - Array of {item_id, quantity} objects
    - Add `indication` (boolean) - Whether there was an indication
    - Add `confirmed_indication` (boolean) - Whether indication was confirmed
    - Keep existing fields for backward compatibility
  
  2. Notes
    - Old fields (explosive_dog_ids, narcotic_dog_ids, items_searched_ids) kept for data migration
    - Status now includes 'Completed' option
    - Teams structure allows specific dog-to-handler assignments
*/

-- Drop the old constraint and add new one with Completed status
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_status_check;
ALTER TABLE missions ADD CONSTRAINT missions_status_check 
  CHECK (status IN ('Active', 'On Standby', 'Emergency', 'Cancelled', 'Completed'));

-- Add new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'missions' AND column_name = 'explosive_teams'
  ) THEN
    ALTER TABLE missions ADD COLUMN explosive_teams jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'missions' AND column_name = 'narcotic_teams'
  ) THEN
    ALTER TABLE missions ADD COLUMN narcotic_teams jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'missions' AND column_name = 'items_with_quantities'
  ) THEN
    ALTER TABLE missions ADD COLUMN items_with_quantities jsonb DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'missions' AND column_name = 'indication'
  ) THEN
    ALTER TABLE missions ADD COLUMN indication boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'missions' AND column_name = 'confirmed_indication'
  ) THEN
    ALTER TABLE missions ADD COLUMN confirmed_indication boolean DEFAULT false;
  END IF;
END $$;