/*
  # Add Default Handler to Dogs

  1. Changes to `dogs` table
    - Add `default_handler_id` (uuid) - References handlers table for the primary/default handler of the dog
    - This enables auto-assignment of handlers when dogs are selected for missions
  
  2. Notes
    - Allows null values since not all dogs may have an assigned handler
    - Can be updated as handler assignments change
    - Foreign key constraint ensures data integrity
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'default_handler_id'
  ) THEN
    ALTER TABLE dogs ADD COLUMN default_handler_id uuid REFERENCES handlers(id) ON DELETE SET NULL;
  END IF;
END $$;