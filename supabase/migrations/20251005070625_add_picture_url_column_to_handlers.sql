/*
  # Add picture_url Column to Handlers Table

  1. Changes
    - Adds `picture_url` column to `handlers` table to store handler profile pictures
    - Column is nullable (TEXT type) to allow handlers without pictures
    - Uses conditional logic to prevent errors if column already exists

  2. Notes
    - This migration safely adds the column only if it doesn't already exist
    - Existing handlers will have NULL picture_url by default
    - Picture URLs will reference images stored in Supabase Storage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'handlers' AND column_name = 'picture_url'
  ) THEN
    ALTER TABLE handlers ADD COLUMN picture_url text;
  END IF;
END $$;
