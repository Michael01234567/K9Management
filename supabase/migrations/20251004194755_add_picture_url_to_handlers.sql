/*
  # Add Picture URL to Handlers Table

  1. Changes
    - Add `picture_url` column to `handlers` table to store handler profile pictures
    - Column is nullable to allow handlers without pictures
    - Uses text type to store storage path or URL

  2. Notes
    - Existing handlers will have NULL picture_url by default
    - Pictures will be stored in Supabase Storage and paths saved here
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