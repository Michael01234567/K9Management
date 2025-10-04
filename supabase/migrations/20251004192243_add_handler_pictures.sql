/*
  # Add Handler Pictures Support

  ## Overview
  This migration adds support for handler profile pictures by:
  1. Adding a picture_url column to the handlers table
  2. Creating a storage bucket for handler pictures
  3. Setting up appropriate storage policies for secure access

  ## 1. Table Changes

  ### `handlers` table
  - Add `picture_url` (text, nullable) - URL to the handler's profile picture in storage

  ## 2. Storage Setup
  - Create `handler-pictures` bucket for storing profile images
  - Enable public access for viewing pictures
  - Restrict uploads to authenticated users with appropriate permissions

  ## 3. Security
  - Public read access to handler pictures (for display)
  - Authenticated users with Handler/Admin role can upload pictures
  - Users can update their own pictures
*/

-- Add picture_url column to handlers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'handlers' AND column_name = 'picture_url'
  ) THEN
    ALTER TABLE handlers ADD COLUMN picture_url text;
  END IF;
END $$;

-- Create storage bucket for handler pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('handler-pictures', 'handler-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for handler pictures

-- Allow public to view handler pictures
CREATE POLICY IF NOT EXISTS "Handler pictures are publicly viewable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'handler-pictures');

-- Allow authenticated users to upload handler pictures
CREATE POLICY IF NOT EXISTS "Authenticated users can upload handler pictures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'handler-pictures' AND
    (get_user_role() IN ('Admin', 'Handler'))
  );

-- Allow authenticated users to update handler pictures
CREATE POLICY IF NOT EXISTS "Authenticated users can update handler pictures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'handler-pictures' AND (get_user_role() IN ('Admin', 'Handler')));

-- Allow authenticated users to delete handler pictures
CREATE POLICY IF NOT EXISTS "Authenticated users can delete handler pictures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'handler-pictures' AND (get_user_role() IN ('Admin', 'Handler')));
