/*
  # Add Employee ID to Handlers Table

  1. Changes
    - Add `employee_id` column to `handlers` table
    - Column is unique and required (non-nullable)
    - Populate existing handlers with sequential employee IDs starting from 150101
    
  2. Data Migration
    - Assigns employee IDs to existing handlers in order of creation
    - Format: 150101, 150102, 150103, etc.
    
  3. Notes
    - New handlers will need to have employee_id provided when created
    - Employee IDs follow the format 150xxx where xxx is sequential
*/

-- Add employee_id column (initially nullable to allow data migration)
ALTER TABLE handlers 
ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- Populate existing handlers with sequential employee IDs
DO $$
DECLARE
  handler_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR handler_record IN 
    SELECT id FROM handlers ORDER BY created_at
  LOOP
    UPDATE handlers 
    SET employee_id = '1501' || LPAD(counter::TEXT, 2, '0')
    WHERE id = handler_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make employee_id NOT NULL after population
ALTER TABLE handlers 
ALTER COLUMN employee_id SET NOT NULL;

-- Add unique constraint on employee_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'handlers_employee_id_unique'
  ) THEN
    ALTER TABLE handlers 
    ADD CONSTRAINT handlers_employee_id_unique UNIQUE (employee_id);
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_handlers_employee_id ON handlers(employee_id);
