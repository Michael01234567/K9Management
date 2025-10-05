/*
  # Add Kong Specialization and Create Fitness Status Table

  ## Overview
  This migration adds "Kong" as a specialization option and creates a new fitness_status table
  to track dog fitness with automatic status management.

  ## 1. Changes to Existing Tables
  
  ### `dogs`
  - Kong specialization is now a valid option (handled at application level)
  
  ## 2. New Tables
  
  ### `fitness_status`
  - `id` (uuid, primary key) - Unique identifier
  - `dog_id` (uuid, foreign key, unique) - References dogs table (one status per dog)
  - `handler_id` (uuid, foreign key) - References handlers table (autofilled from dog assignment)
  - `weight_kg` (decimal) - Current weight of the dog
  - `status` (text, required) - Current fitness status (Training Only, Sick, Estrus, After Care, Fit)
  - `duration_start` (date) - Start date for non-Fit statuses
  - `duration_end` (date) - End date for non-Fit statuses
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 3. Security
  - Enable RLS on fitness_status table
  - Add policies based on user roles (Admin, Handler, Veterinarian, Viewer)
  
  ## 4. Important Notes
  - Each dog can have only ONE fitness status record (enforced by unique constraint on dog_id)
  - Status defaults to 'Fit' when created
  - Duration fields are nullable (only used for non-Fit statuses)
  - Automatic status changes to 'Fit' after duration_end will be handled by application logic
*/

-- Create fitness_status table
CREATE TABLE IF NOT EXISTS fitness_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL UNIQUE REFERENCES dogs(id) ON DELETE CASCADE,
  handler_id uuid REFERENCES handlers(id) ON DELETE SET NULL,
  weight_kg decimal(10, 2),
  status text NOT NULL DEFAULT 'Fit',
  duration_start date,
  duration_end date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_fitness_status_dog_id ON fitness_status(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_status_handler_id ON fitness_status(handler_id);
CREATE INDEX IF NOT EXISTS idx_fitness_status_duration_end ON fitness_status(duration_end);

-- Enable Row Level Security
ALTER TABLE fitness_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fitness_status table

-- SELECT - All authenticated users can view
DROP POLICY IF EXISTS "Fitness status viewable by authenticated users" ON fitness_status;
CREATE POLICY "Fitness status viewable by authenticated users"
  ON fitness_status FOR SELECT
  TO authenticated
  USING (true);

-- INSERT - Admins, Handlers, Veterinarians
DROP POLICY IF EXISTS "Admins, handlers, and vets can create fitness status" ON fitness_status;
CREATE POLICY "Admins, handlers, and vets can create fitness status"
  ON fitness_status FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'));

-- UPDATE - Admins, Handlers, Veterinarians
DROP POLICY IF EXISTS "Admins, handlers, and vets can update fitness status" ON fitness_status;
CREATE POLICY "Admins, handlers, and vets can update fitness status"
  ON fitness_status FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'))
  WITH CHECK (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'));

-- DELETE - Admins only
DROP POLICY IF EXISTS "Only admins can delete fitness status" ON fitness_status;
CREATE POLICY "Only admins can delete fitness status"
  ON fitness_status FOR DELETE
  TO authenticated
  USING (get_user_role() = 'Admin');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_fitness_status_updated_at ON fitness_status;
CREATE TRIGGER update_fitness_status_updated_at
  BEFORE UPDATE ON fitness_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update status to 'Fit' when duration ends
CREATE OR REPLACE FUNCTION auto_update_fitness_status()
RETURNS void AS $$
BEGIN
  UPDATE fitness_status
  SET 
    status = 'Fit',
    duration_start = NULL,
    duration_end = NULL,
    updated_at = now()
  WHERE 
    status != 'Fit' 
    AND duration_end IS NOT NULL 
    AND duration_end < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;