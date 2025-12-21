/*
  # Create Dog-Officer Assignment Table

  1. New Tables
    - `dog_officer`
      - `id` (uuid, primary key)
      - `dog_id` (uuid, foreign key to dogs)
      - `officer_id` (uuid, foreign key to mission_officers)
      - `assigned_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on `dog_officer` table
    - Add policy for authenticated users to read all assignments
    - Add policy for authenticated users to insert assignments
    - Add policy for authenticated users to update assignments
    - Add policy for authenticated users to delete assignments
  
  3. Notes
    - This table allows assigning mission officers to dogs
    - Similar structure to dog_handler table
*/

-- Create dog_officer table
CREATE TABLE IF NOT EXISTS dog_officer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  officer_id uuid REFERENCES mission_officers(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(dog_id, officer_id)
);

-- Enable RLS
ALTER TABLE dog_officer ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read dog officer assignments"
  ON dog_officer
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dog officer assignments"
  ON dog_officer
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dog officer assignments"
  ON dog_officer
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dog officer assignments"
  ON dog_officer
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_dog_officer_dog_id ON dog_officer(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_officer_officer_id ON dog_officer(officer_id);
