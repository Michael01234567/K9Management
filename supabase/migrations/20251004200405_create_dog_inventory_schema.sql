/*
  # Dog Inventory Management System - Database Schema

  ## Overview
  This migration creates the complete database structure for a dog inventory management
  system with handlers, veterinary records, and fitness tracking capabilities.

  ## 1. New Tables

  ### `handlers`
  - `id` (uuid, primary key) - Unique identifier for each handler
  - `full_name` (text, required) - Handler's full name
  - `email` (text, unique) - Contact email address
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `dogs`
  - `id` (uuid, primary key) - Unique identifier for each dog
  - `name` (text, required) - Dog's name
  - `breed` (text, required) - Dog's breed
  - `sex` (text, required) - Dog's sex (Male/Female)
  - `microchip_number` (text, unique) - Unique microchip identifier
  - `dob` (date, required) - Date of birth
  - `training_level` (text, required) - Current training phase
  - `location` (text) - Current location or base
  - `origin` (text) - Origin/source of the dog
  - `note` (text) - General notes about the dog
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `dog_handler` (Junction Table)
  - `id` (uuid, primary key) - Unique identifier
  - `dog_id` (uuid, foreign key) - References dogs table
  - `handler_id` (uuid, foreign key) - References handlers table
  - `assigned_at` (timestamptz) - Assignment timestamp
  - Unique constraint on (dog_id, handler_id) to prevent duplicates

  ### `vet_records`
  - `id` (uuid, primary key) - Unique identifier
  - `dog_id` (uuid, foreign key) - References dogs table
  - `visit_date` (date, required) - Date of veterinary visit
  - `visit_type` (text, required) - Type of visit (vaccination, checkup, surgery, etc.)
  - `notes` (text) - Detailed notes from the visit
  - `next_visit_date` (date) - Scheduled next visit
  - `created_at` (timestamptz) - Record creation timestamp

  ### `fitness_logs`
  - `id` (uuid, primary key) - Unique identifier
  - `dog_id` (uuid, foreign key) - References dogs table
  - `log_date` (date, required) - Date of activity
  - `activity_type` (text, required) - Type of activity (run, walk, training, etc.)
  - `duration_minutes` (integer) - Duration in minutes
  - `distance_km` (decimal) - Distance covered in kilometers
  - `weight_kg` (decimal) - Dog's weight in kilograms
  - `notes` (text) - Additional notes about the session
  - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated users to manage all records
  - Policies allow full CRUD operations for authenticated users

  ## 3. Indexes
  - Create indexes on foreign keys for optimal query performance
  - Index on dog name for faster searches
  - Index on handler name for faster lookups

  ## 4. Important Notes
  - All tables use UUID primary keys for security and scalability
  - Training levels are stored as text to allow flexibility
  - Timestamps are automatically managed with triggers
  - Foreign key constraints ensure data integrity
  - Cascade deletes on dog_handler to maintain referential integrity
*/

-- Create handlers table
CREATE TABLE IF NOT EXISTS handlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dogs table
CREATE TABLE IF NOT EXISTS dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  breed text NOT NULL,
  sex text NOT NULL,
  microchip_number text UNIQUE,
  dob date NOT NULL,
  training_level text NOT NULL,
  location text,
  origin text,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create dog_handler junction table (many-to-many)
CREATE TABLE IF NOT EXISTS dog_handler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  handler_id uuid NOT NULL REFERENCES handlers(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(dog_id, handler_id)
);

-- Create vet_records table
CREATE TABLE IF NOT EXISTS vet_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  visit_type text NOT NULL,
  notes text,
  next_visit_date date,
  created_at timestamptz DEFAULT now()
);

-- Create fitness_logs table
CREATE TABLE IF NOT EXISTS fitness_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  activity_type text NOT NULL,
  duration_minutes integer,
  distance_km decimal(10, 2),
  weight_kg decimal(10, 2),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dog_handler_dog_id ON dog_handler(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_handler_handler_id ON dog_handler(handler_id);
CREATE INDEX IF NOT EXISTS idx_vet_records_dog_id ON vet_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_dog_id ON fitness_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_dogs_name ON dogs(name);
CREATE INDEX IF NOT EXISTS idx_handlers_full_name ON handlers(full_name);

-- Enable Row Level Security
ALTER TABLE handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_handler ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for handlers table
CREATE POLICY "Authenticated users can view handlers"
  ON handlers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert handlers"
  ON handlers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update handlers"
  ON handlers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete handlers"
  ON handlers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for dogs table
CREATE POLICY "Authenticated users can view dogs"
  ON dogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dogs"
  ON dogs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dogs"
  ON dogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dogs"
  ON dogs FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for dog_handler table
CREATE POLICY "Authenticated users can view dog_handler"
  ON dog_handler FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert dog_handler"
  ON dog_handler FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dog_handler"
  ON dog_handler FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dog_handler"
  ON dog_handler FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for vet_records table
CREATE POLICY "Authenticated users can view vet_records"
  ON vet_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert vet_records"
  ON vet_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vet_records"
  ON vet_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vet_records"
  ON vet_records FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for fitness_logs table
CREATE POLICY "Authenticated users can view fitness_logs"
  ON fitness_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert fitness_logs"
  ON fitness_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fitness_logs"
  ON fitness_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fitness_logs"
  ON fitness_logs FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_handlers_updated_at
  BEFORE UPDATE ON handlers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dogs_updated_at
  BEFORE UPDATE ON dogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();