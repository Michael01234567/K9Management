/*
  # Create Handler Pictures Storage Bucket

  ## Overview
  This migration creates a storage bucket for handler profile pictures and sets up
  appropriate access policies for authenticated users.

  ## 1. Storage Bucket
  - Create 'handler-pictures' bucket with public access
  - Allow authenticated users to upload and manage handler pictures

  ## 2. Security
  - Enable RLS on storage bucket
  - Authenticated users can upload, update, and delete pictures
  - Anyone can view pictures (public bucket)

  ## 3. Important Notes
  - Bucket is public so pictures can be viewed without authentication
  - Only authenticated users can upload/modify pictures
  - File size limits should be enforced at application level
*/

-- Create the handler-pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'handler-pictures',
  'handler-pictures',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload handler pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update handler pictures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete handler pictures" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view handler pictures" ON storage.objects;

-- Allow authenticated users to upload pictures
CREATE POLICY "Authenticated users can upload handler pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'handler-pictures');

-- Allow authenticated users to update pictures
CREATE POLICY "Authenticated users can update handler pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'handler-pictures')
WITH CHECK (bucket_id = 'handler-pictures');

-- Allow authenticated users to delete pictures
CREATE POLICY "Authenticated users can delete handler pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'handler-pictures');

-- Allow anyone to view pictures (public bucket)
CREATE POLICY "Anyone can view handler pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'handler-pictures');