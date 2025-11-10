/*
  # Initialize Complete K9 Management Database
  
  ## Overview
  This migration creates the complete database schema for the K9 management system
  with all tables, relationships, and security policies.
  
  ## 1. Tables Created
  
  ### Core Tables
  - **handlers** - Handler information with contact details and pictures
  - **dogs** - Complete dog records with training, specialization, and location
  - **dog_handler** - Many-to-many relationship between dogs and handlers
  - **locations** - Physical locations for dog assignments
  - **mission_locations** - Mission-specific locations (airports, border crossings)
  
  ### Health & Fitness Tables
  - **vet_records** - Veterinary visit records and scheduling
  - **fitness_logs** - Daily activity, training, and weight tracking
  - **fitness_status** - Current fitness status with duration tracking
  
  ### User Management
  - **users** - Application users with role-based access
  
  ## 2. Security
  - RLS enabled on all tables
  - Authenticated users have full access to all data
  - Suitable for internal K9 management system
  
  ## 3. Data
  - Includes UAE airports and border crossings for mission planning
  
  ## 4. Indexes
  - Foreign key indexes for optimal query performance
  - Unique constraints for data integrity
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
  location_id uuid,
  origin text,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE LOCATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  address text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CREATE MISSION LOCATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS mission_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  address text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- ADD FOREIGN KEY TO DOGS TABLE
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'dogs_location_id_fkey'
  ) THEN
    ALTER TABLE dogs ADD CONSTRAINT dogs_location_id_fkey 
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL;
  END IF;
END $$;

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

CREATE INDEX IF NOT EXISTS idx_dogs_location_id ON dogs(location_id);
CREATE INDEX IF NOT EXISTS idx_dog_handler_dog_id ON dog_handler(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_handler_handler_id ON dog_handler(handler_id);
CREATE INDEX IF NOT EXISTS idx_vet_records_dog_id ON vet_records(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_dog_id ON fitness_logs(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_status_dog_id ON fitness_status(dog_id);
CREATE INDEX IF NOT EXISTS idx_fitness_status_handler_id ON fitness_status(handler_id);

-- ============================================
-- POPULATE UAE MISSION LOCATIONS
-- ============================================

INSERT INTO mission_locations (name, address, latitude, longitude, description, created_at, updated_at)
VALUES
  -- UAE INTERNATIONAL AIRPORTS
  (
    'Dubai International Airport (DXB)',
    'Dubai, United Arab Emirates',
    25.2532,
    55.3657,
    'World''s busiest international airport by passenger traffic. Major hub for Middle East, Europe, Asia, and Africa connections. Critical point for customs and cargo screening operations.',
    now(),
    now()
  ),
  (
    'Abu Dhabi International Airport (AUH)',
    'Abu Dhabi, United Arab Emirates',
    24.4330,
    54.6511,
    'Capital''s primary international airport and major regional hub. Home to Etihad Airways and handles significant international cargo and passenger operations.',
    now(),
    now()
  ),
  (
    'Sharjah International Airport (SHJ)',
    'Sharjah, United Arab Emirates',
    25.3286,
    55.5172,
    'Third largest airport in UAE serving Northern Emirates. Major cargo hub with significant freight operations. Strategic location for customs screening.',
    now(),
    now()
  ),
  (
    'Al Maktoum International Airport (DWC)',
    'Dubai World Central, Dubai, United Arab Emirates',
    24.8967,
    55.1614,
    'Dubai''s second airport at Dubai World Central. Rapidly expanding cargo operations with dedicated freight terminals. Future expansion planned to become world''s largest airport.',
    now(),
    now()
  ),
  (
    'Ras Al Khaimah International Airport (RKT)',
    'Ras Al Khaimah, United Arab Emirates',
    25.6135,
    55.9388,
    'Serves northern emirates with domestic and international flights. Growing cargo operations and regional connectivity. Important point for northern UAE customs operations.',
    now(),
    now()
  ),
  (
    'Fujairah International Airport (FJR)',
    'Fujairah, United Arab Emirates',
    25.1121,
    56.3241,
    'Only UAE airport on the east coast facing Gulf of Oman. Strategic location for cargo and passenger operations. Key point for eastern seaboard customs control.',
    now(),
    now()
  ),
  
  -- UAE-SAUDI ARABIA LAND BORDERS
  (
    'Al Ghuwaifat Border Crossing',
    'Al Ghuwaifat, Abu Dhabi, United Arab Emirates',
    24.0161,
    51.6179,
    'Main land border crossing between UAE and Saudi Arabia. Located on western edge of Abu Dhabi emirate. Major route for commercial trucks and passenger traffic between GCC countries.',
    now(),
    now()
  ),
  (
    'Al Dhafra Border Crossing',
    'Al Dhafra Region, Abu Dhabi, United Arab Emirates',
    23.8450,
    52.5180,
    'Southern border point connecting UAE to Saudi Arabia. Strategic location for trade and commercial vehicle screening. Serves southern routes through Empty Quarter region.',
    now(),
    now()
  ),
  
  -- UAE-OMAN LAND BORDERS
  (
    'Hatta Border Crossing',
    'Hatta, Dubai, United Arab Emirates',
    24.8032,
    56.1261,
    'Mountain border crossing connecting Dubai to Oman via scenic Hajar Mountain route. Popular for tourist and commercial traffic. Important customs checkpoint for eastern routes.',
    now(),
    now()
  ),
  (
    'Al Ain (Mezyad) Border Crossing',
    'Al Ain, Abu Dhabi, United Arab Emirates',
    24.1958,
    55.7964,
    'Major international border crossing in Al Ain connecting UAE to Oman. High-volume crossing for both passenger and commercial traffic. Critical point for customs and border security operations.',
    now(),
    now()
  ),
  (
    'Khatmat Malaha Border Crossing',
    'Khatmat Malaha, Ras Al Khaimah, United Arab Emirates',
    25.2919,
    56.0947,
    'Northern border crossing connecting Ras Al Khaimah to Oman. Serves northern emirates with access to Musandam region. Strategic point for customs operations in northern UAE.',
    now(),
    now()
  ),
  (
    'Al Wajajah Border Crossing',
    'Al Wajajah, Fujairah, United Arab Emirates',
    25.3394,
    56.2461,
    'Eastern border crossing between Fujairah and Oman. Serves east coast traffic and commercial operations. Important customs checkpoint for eastern seaboard trade routes.',
    now(),
    now()
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE fitness_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_handler ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES FOR FITNESS_STATUS
-- ============================================

CREATE POLICY "Authenticated users can view fitness status"
  ON fitness_status FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create fitness status"
  ON fitness_status FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fitness status"
  ON fitness_status FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fitness status"
  ON fitness_status FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CREATE POLICIES FOR USERS
-- ============================================

CREATE POLICY "Authenticated users can view users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CREATE POLICIES FOR LOCATIONS
-- ============================================

CREATE POLICY "Authenticated users can view locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CREATE POLICIES FOR MISSION_LOCATIONS
-- ============================================

CREATE POLICY "Authenticated users can view mission locations"
  ON mission_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create mission locations"
  ON mission_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mission locations"
  ON mission_locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete mission locations"
  ON mission_locations FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CREATE POLICIES FOR HANDLERS
-- ============================================

CREATE POLICY "Authenticated users can view handlers"
  ON handlers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create handlers"
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

-- ============================================
-- CREATE POLICIES FOR DOGS
-- ============================================

CREATE POLICY "Authenticated users can view dogs"
  ON dogs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create dogs"
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

-- ============================================
-- CREATE POLICIES FOR DOG_HANDLER
-- ============================================

CREATE POLICY "Authenticated users can view dog-handler relationships"
  ON dog_handler FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create dog-handler relationships"
  ON dog_handler FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update dog-handler relationships"
  ON dog_handler FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dog-handler relationships"
  ON dog_handler FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CREATE POLICIES FOR VET_RECORDS
-- ============================================

CREATE POLICY "Authenticated users can view vet records"
  ON vet_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create vet records"
  ON vet_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vet records"
  ON vet_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vet records"
  ON vet_records FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- CREATE POLICIES FOR FITNESS_LOGS
-- ============================================

CREATE POLICY "Authenticated users can view fitness logs"
  ON fitness_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create fitness logs"
  ON fitness_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fitness logs"
  ON fitness_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fitness logs"
  ON fitness_logs FOR DELETE
  TO authenticated
  USING (true);