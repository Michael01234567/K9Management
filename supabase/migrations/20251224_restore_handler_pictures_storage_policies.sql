/*
  # Restore Storage Policies for Handler Pictures

  ## Overview
  This migration recreates the missing storage policies for the handler-pictures bucket.
  These policies were dropped in migration 20251005065736 and never restored.

  ## Changes
  - Add INSERT policy to allow authenticated users to upload handler pictures
  - Add UPDATE policy to allow authenticated users to update handler pictures  
  - Add DELETE policy to allow authenticated users to delete handler pictures
  - Add SELECT policy to allow anyone to view handler pictures (public bucket)

  ## Security
  - Authenticated users can upload/update/delete pictures
  - Public can view pictures (read-only)
*/

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
