/*
  # Add specialization field to dogs table

  ## Overview
  This migration adds a specialization field to the dogs table to track
  what type of detection work each dog specializes in.

  ## 1. Changes to Tables

  ### `dogs`
  - Add `specialization` (text) - Dog's area of specialization
    Options: Explosive, Narcotic, Tobacco, RAS Cargo, Currency

  ## 2. Important Notes
  - Uses IF NOT EXISTS pattern to prevent errors on re-run
  - Field is optional (nullable) to support existing records
  - No default value to allow flexibility in data entry
*/

-- Add specialization column to dogs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'specialization'
  ) THEN
    ALTER TABLE dogs ADD COLUMN specialization text;
  END IF;
END $$;