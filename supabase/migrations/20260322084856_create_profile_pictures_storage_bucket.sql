/*
  # Create Profile Pictures Storage Bucket

  ## Summary
  Creates a public storage bucket for handler and mission officer profile pictures,
  with appropriate RLS policies to allow authenticated users to upload/manage images
  and the public to view them.

  ## Storage Bucket
  - `handler-pictures`: Public bucket for all profile pictures (handlers and mission officers)
    - Max file size: 5MB
    - Allowed types: JPEG, PNG, GIF, WebP

  ## Policies
  - Authenticated users can upload (INSERT)
  - Authenticated users can update (UPDATE)
  - Authenticated users can delete (DELETE)
  - Public (anonymous) users can view/download (SELECT)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'handler-pictures',
  'handler-pictures',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload profile pictures'
  ) THEN
    CREATE POLICY "Authenticated users can upload profile pictures"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'handler-pictures');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can update profile pictures'
  ) THEN
    CREATE POLICY "Authenticated users can update profile pictures"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'handler-pictures')
      WITH CHECK (bucket_id = 'handler-pictures');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can delete profile pictures'
  ) THEN
    CREATE POLICY "Authenticated users can delete profile pictures"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'handler-pictures');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view profile pictures'
  ) THEN
    CREATE POLICY "Public can view profile pictures"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'handler-pictures');
  END IF;
END $$;
