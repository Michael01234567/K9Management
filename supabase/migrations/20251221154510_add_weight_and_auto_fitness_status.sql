/*
  # Add Weight Field to Dogs and Auto-Create Fitness Status

  ## Changes Made

  1. New Column
    - Add `weight_kg` (numeric) to `dogs` table for tracking dog's weight

  2. Trigger Function
    - Create function to automatically insert a fitness status record with "Fit" status when a new dog is created
    - Links the fitness status to the newly created dog

  3. Trigger
    - Set up trigger on `dogs` table that fires after INSERT
    - Automatically creates initial fitness status entry

  ## Important Notes
    - Weight field is optional and can be updated later
    - Initial fitness status is set to "Fit" by default
    - Trigger ensures every dog always has a fitness status record
*/

-- Add weight_kg column to dogs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dogs' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE dogs ADD COLUMN weight_kg numeric(5,2);
  END IF;
END $$;

-- Create function to auto-create fitness status for new dogs
CREATE OR REPLACE FUNCTION create_default_fitness_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO fitness_status (dog_id, weight_kg, status)
  VALUES (NEW.id, NEW.weight_kg, 'Fit');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create fitness status when a new dog is added
DROP TRIGGER IF EXISTS trigger_create_fitness_status ON dogs;

CREATE TRIGGER trigger_create_fitness_status
  AFTER INSERT ON dogs
  FOR EACH ROW
  EXECUTE FUNCTION create_default_fitness_status();
