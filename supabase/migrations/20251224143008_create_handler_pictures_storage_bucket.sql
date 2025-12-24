/*
  # Create Handler Pictures Storage Bucket and Policies

  ## Overview
  Creates the handler-pictures storage bucket and all necessary RLS policies
  to allow authenticated users to upload handler profile pictures.

  ## Changes
  1. Create handler-pictures storage bucket (public)
  2. Add INSERT policy for authenticated users to upload pictures
  3. Add UPDATE policy for authenticated users to modify pictures
  4. Add DELETE policy for authenticated users to remove pictures
  5. Add SELECT policy for public to view pictures

  ## Security
  - Authenticated users can upload/update/delete handler pictures
  - Public (unauthenticated) users can view pictures (read-only)
  - Bucket is public to allow picture URLs to be accessed without auth
*/

-- Create the handler-pictures bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'handler-pictures',
  'handler-pictures',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload pictures
DROP POLICY IF EXISTS "Authenticated users can upload handler pictures" ON storage.objects;
CREATE POLICY "Authenticated users can upload handler pictures"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'handler-pictures');

-- Allow authenticated users to update pictures
DROP POLICY IF EXISTS "Authenticated users can update handler pictures" ON storage.objects;
CREATE POLICY "Authenticated users can update handler pictures"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'handler-pictures')
  WITH CHECK (bucket_id = 'handler-pictures');

-- Allow authenticated users to delete pictures
DROP POLICY IF EXISTS "Authenticated users can delete handler pictures" ON storage.objects;
CREATE POLICY "Authenticated users can delete handler pictures"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'handler-pictures');

-- Allow anyone to view pictures (public bucket)
DROP POLICY IF EXISTS "Anyone can view handler pictures" ON storage.objects;
CREATE POLICY "Anyone can view handler pictures"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'handler-pictures');
