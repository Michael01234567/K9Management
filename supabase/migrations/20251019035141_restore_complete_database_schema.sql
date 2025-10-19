/*
  # Restore Complete Database Schema

  ## Overview
  This migration restores all necessary tables for the dog inventory management system
  with RLS disabled for simplified access control.

  ## 1. New Tables

  ### handlers
  - `id` (uuid, primary key) - Unique handler identifier
  - `full_name` (text, required) - Handler's full name
  - `email` (text, optional) - Contact email
  - `phone` (text, optional) - Contact phone number
  - `picture_url` (text, optional) - URL to handler's picture
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### dogs
  - `id` (uuid, primary key) - Unique dog identifier
  - `name` (text, required) - Dog's name
  - `breed` (text, required) - Dog breed
  - `sex` (text, required) - Male or Female
  - `microchip_number` (text, optional) - Unique microchip identifier
  - `dob` (date, required) - Date of birth
  - `training_level` (text, required) - Current training phase
  - `specialization` (text, optional) - Detection specialization type
  - `location` (text, optional) - Current location
  - `origin` (text, optional) - Origin/source information
  - `note` (text, optional) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### dog_handler
  - `id` (uuid, primary key) - Assignment identifier
  - `dog_id` (uuid, foreign key) - References dogs table
  - `handler_id` (uuid, foreign key) - References handlers table
  - `assigned_at` (timestamptz) - Assignment timestamp

  ### vet_records
  - `id` (uuid, primary key) - Record identifier
  - `dog_id` (uuid, foreign key) - References dogs table
  - `visit_date` (date, required) - Vet visit date
  - `visit_type` (text, required) - Type of visit
  - `notes` (text, optional) - Visit notes
  - `next_visit_date` (date, optional) - Scheduled next visit
  - `created_at` (timestamptz) - Record creation timestamp

  ### fitness_logs
  - `id` (uuid, primary key) - Log identifier
  - `dog_id` (uuid, foreign key) - References dogs table
  - `log_date` (date, required) - Activity date
  - `activity_type` (text, required) - Type of activity
  - `duration_minutes` (integer, optional) - Activity duration
  - `distance_km` (numeric, optional) - Distance covered
  - `weight_kg` (numeric, optional) - Dog weight measurement
  - `notes` (text, optional) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### fitness_status
  - `id` (uuid, primary key) - Status identifier
  - `dog_id` (uuid, foreign key) - References dogs table
  - `handler_id` (uuid, foreign key, optional) - References handlers table
  - `weight_kg` (numeric, optional) - Current weight
  - `status` (text, required) - Fitness status
  - `duration_start` (date, optional) - Status start date
  - `duration_end` (date, optional) - Status end date
  - `notes` (text, optional) - Status notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### users
  - `id` (uuid, primary key) - User identifier (matches auth.users.id)
  - `email` (text, required) - User email
  - `full_name` (text, optional) - User's full name
  - `role` (text, required) - User role (Admin, Handler, Veterinarian, Viewer)
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Indexes
  - Foreign key indexes for improved query performance
  - Unique constraints on dog-handler assignments

  ## 3. Security
  - RLS is DISABLED on all tables for simplified access
  - All data is accessible without authentication restrictions
*/

-- ============================================
-- CREATE HANDLERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS handlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE DOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  breed text NOT NULL,
  sex text NOT NULL,
  microchip_number text,
  dob date NOT NULL,
  training_level text NOT NULL,
  specialization text,
  location text,
  origin text,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE DOG_HANDLER JUNCTION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS dog_handler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  handler_id uuid NOT NULL REFERENCES handlers(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(dog_id, handler_id)
);

-- ============================================
-- CREATE VET_RECORDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS vet_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  visit_type text NOT NULL,
  notes text,
  next_visit_date date,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE FITNESS_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS fitness_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  activity_type text NOT NULL,
  duration_minutes integer,
  distance_km numeric(5,2),
  weight_kg numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE FITNESS_STATUS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS fitness_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  handler_id uuid REFERENCES handlers(id) ON DELETE SET NULL,
  weight_kg numeric(5,2),
  status text NOT NULL,
  duration_start date,
  duration_end date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'Viewer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_dog_handler_dog_id ON dog_handler(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_handler_handler_id ON dog_handler(handler_id);
CREATE INDEX IF NOT EXISTS idx_vet_records_dog_id ON vet_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_dog_id ON fitness_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_status_dog_id ON fitness_status(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_status_handler_id ON fitness_status(handler_id);

-- ============================================
-- DISABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE handlers DISABLE ROW LEVEL SECURITY;
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE dog_handler DISABLE ROW LEVEL SECURITY;
ALTER TABLE vet_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;