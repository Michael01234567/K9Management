/*
  # Create Complete K9 Management Database Schema

  ## Overview
  Full schema for the K9 management system including all tables, relationships,
  triggers, RLS policies, seed data, and security improvements.

  ## Tables Created
  1. handlers - Handler profiles with employee IDs, roles, and pictures
  2. dogs - Dog records with specialization, location, and weight
  3. locations - Physical locations for dog assignments
  4. mission_locations - Airports and border crossings for missions
  5. dog_handler - Many-to-many: dogs <-> handlers
  6. vet_records - Veterinary visit history
  7. fitness_logs - Daily fitness tracking per dog
  8. fitness_status - Current fitness status per dog
  9. users - Application users linked to auth.users
  10. mission_officers - ICP officers managing missions
  11. dog_officer - Many-to-many: dogs <-> mission_officers
  12. items - Searchable item categories for missions
  13. missions - Mission records with teams, locations, and outcomes

  ## Security
  - RLS enabled on all tables
  - All policies require auth.uid() IS NOT NULL
  - Authenticated users have full CRUD access (internal system)

  ## Data
  - UAE airports and land border crossings seeded
  - 10 sample mission officers seeded
  - Common searchable items seeded

  ## Triggers
  - Auto-creates default "Fit" fitness status when a new dog is added
*/

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS handlers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL DEFAULT '',
  full_name text NOT NULL,
  email text,
  phone text,
  picture_url text,
  team_leader boolean DEFAULT false,
  driver boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  origin text,
  note text,
  weight_kg numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS dog_handler (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  handler_id uuid NOT NULL REFERENCES handlers(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(dog_id, handler_id)
);

CREATE TABLE IF NOT EXISTS vet_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  visit_type text NOT NULL,
  notes text,
  next_visit_date date,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'Viewer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mission_officers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dog_officer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id uuid REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  officer_id uuid REFERENCES mission_officers(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(dog_id, officer_id)
);

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  mission_location_id uuid REFERENCES mission_locations(id) ON DELETE SET NULL,
  departure_time time,
  return_time time,
  explosive_dog_ids uuid[] DEFAULT '{}',
  narcotic_dog_ids uuid[] DEFAULT '{}',
  handler_ids uuid[] DEFAULT '{}',
  mission_officer_id uuid REFERENCES mission_officers(id) ON DELETE SET NULL,
  team_leader_id uuid REFERENCES handlers(id) ON DELETE SET NULL,
  driver_id uuid REFERENCES handlers(id) ON DELETE SET NULL,
  training boolean DEFAULT false,
  search boolean DEFAULT false,
  num_items_searched integer DEFAULT 0,
  items_searched_ids uuid[] DEFAULT '{}',
  explosive_teams jsonb DEFAULT '[]',
  narcotic_teams jsonb DEFAULT '[]',
  items_with_quantities jsonb DEFAULT '[]',
  indication boolean DEFAULT false,
  confirmed_indication boolean DEFAULT false,
  comments text,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'On Standby', 'Emergency', 'Cancelled', 'Completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- TRIGGER: Auto-create fitness status for new dogs
-- ============================================

CREATE OR REPLACE FUNCTION create_default_fitness_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO fitness_status (dog_id, weight_kg, status)
  VALUES (NEW.id, NEW.weight_kg, 'Fit');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_fitness_status ON dogs;
CREATE TRIGGER trigger_create_fitness_status
  AFTER INSERT ON dogs
  FOR EACH ROW
  EXECUTE FUNCTION create_default_fitness_status();

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_handler ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_officer ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: handlers
-- ============================================

CREATE POLICY "Authenticated users can view handlers"
  ON handlers FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create handlers"
  ON handlers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update handlers"
  ON handlers FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete handlers"
  ON handlers FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: locations
-- ============================================

CREATE POLICY "Authenticated users can view locations"
  ON locations FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create locations"
  ON locations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update locations"
  ON locations FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete locations"
  ON locations FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: dogs
-- ============================================

CREATE POLICY "Authenticated users can view dogs"
  ON dogs FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create dogs"
  ON dogs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dogs"
  ON dogs FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dogs"
  ON dogs FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: mission_locations
-- ============================================

CREATE POLICY "Authenticated users can view mission locations"
  ON mission_locations FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create mission locations"
  ON mission_locations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update mission locations"
  ON mission_locations FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete mission locations"
  ON mission_locations FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: dog_handler
-- ============================================

CREATE POLICY "Authenticated users can view dog-handler relationships"
  ON dog_handler FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create dog-handler relationships"
  ON dog_handler FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dog-handler relationships"
  ON dog_handler FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dog-handler relationships"
  ON dog_handler FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: vet_records
-- ============================================

CREATE POLICY "Authenticated users can view vet records"
  ON vet_records FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create vet records"
  ON vet_records FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update vet records"
  ON vet_records FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete vet records"
  ON vet_records FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: fitness_logs
-- ============================================

CREATE POLICY "Authenticated users can view fitness logs"
  ON fitness_logs FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create fitness logs"
  ON fitness_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fitness logs"
  ON fitness_logs FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fitness logs"
  ON fitness_logs FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: fitness_status
-- ============================================

CREATE POLICY "Authenticated users can view fitness status"
  ON fitness_status FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create fitness status"
  ON fitness_status FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fitness status"
  ON fitness_status FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fitness status"
  ON fitness_status FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: users
-- ============================================

CREATE POLICY "Authenticated users can view users"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert users"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update users"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: mission_officers
-- ============================================

CREATE POLICY "Authenticated users can read mission officers"
  ON mission_officers FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert mission officers"
  ON mission_officers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update mission officers"
  ON mission_officers FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete mission officers"
  ON mission_officers FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: dog_officer
-- ============================================

CREATE POLICY "Authenticated users can read dog officer assignments"
  ON dog_officer FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert dog officer assignments"
  ON dog_officer FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dog officer assignments"
  ON dog_officer FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dog officer assignments"
  ON dog_officer FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: items
-- ============================================

CREATE POLICY "Authenticated users can read items"
  ON items FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert items"
  ON items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete items"
  ON items FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- RLS POLICIES: missions
-- ============================================

CREATE POLICY "Authenticated users can read missions"
  ON missions FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert missions"
  ON missions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update missions"
  ON missions FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete missions"
  ON missions FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- SEED: UAE Mission Locations
-- ============================================

INSERT INTO mission_locations (name, address, latitude, longitude, description)
VALUES
  ('Dubai International Airport (DXB)', 'Dubai, United Arab Emirates', 25.2532, 55.3657, 'World''s busiest international airport by passenger traffic. Major hub for Middle East, Europe, Asia, and Africa connections. Critical point for customs and cargo screening operations.'),
  ('Abu Dhabi International Airport (AUH)', 'Abu Dhabi, United Arab Emirates', 24.4330, 54.6511, 'Capital''s primary international airport and major regional hub. Home to Etihad Airways and handles significant international cargo and passenger operations.'),
  ('Sharjah International Airport (SHJ)', 'Sharjah, United Arab Emirates', 25.3286, 55.5172, 'Third largest airport in UAE serving Northern Emirates. Major cargo hub with significant freight operations. Strategic location for customs screening.'),
  ('Al Maktoum International Airport (DWC)', 'Dubai World Central, Dubai, United Arab Emirates', 24.8967, 55.1614, 'Dubai''s second airport at Dubai World Central. Rapidly expanding cargo operations with dedicated freight terminals.'),
  ('Ras Al Khaimah International Airport (RKT)', 'Ras Al Khaimah, United Arab Emirates', 25.6135, 55.9388, 'Serves northern emirates with domestic and international flights. Growing cargo operations and regional connectivity.'),
  ('Fujairah International Airport (FJR)', 'Fujairah, United Arab Emirates', 25.1121, 56.3241, 'Only UAE airport on the east coast facing Gulf of Oman. Strategic location for cargo and passenger operations.'),
  ('Al Ghuwaifat Border Crossing', 'Al Ghuwaifat, Abu Dhabi, United Arab Emirates', 24.0161, 51.6179, 'Main land border crossing between UAE and Saudi Arabia. Major route for commercial trucks and passenger traffic between GCC countries.'),
  ('Al Dhafra Border Crossing', 'Al Dhafra Region, Abu Dhabi, United Arab Emirates', 23.8450, 52.5180, 'Southern border point connecting UAE to Saudi Arabia. Strategic location for trade and commercial vehicle screening.'),
  ('Hatta Border Crossing', 'Hatta, Dubai, United Arab Emirates', 24.8032, 56.1261, 'Mountain border crossing connecting Dubai to Oman via scenic Hajar Mountain route. Popular for tourist and commercial traffic.'),
  ('Al Ain (Mezyad) Border Crossing', 'Al Ain, Abu Dhabi, United Arab Emirates', 24.1958, 55.7964, 'Major international border crossing in Al Ain connecting UAE to Oman. High-volume crossing for both passenger and commercial traffic.'),
  ('Khatmat Malaha Border Crossing', 'Khatmat Malaha, Ras Al Khaimah, United Arab Emirates', 25.2919, 56.0947, 'Northern border crossing connecting Ras Al Khaimah to Oman. Serves northern emirates with access to Musandam region.'),
  ('Al Wajajah Border Crossing', 'Al Wajajah, Fujairah, United Arab Emirates', 25.3394, 56.2461, 'Eastern border crossing between Fujairah and Oman. Serves east coast traffic and commercial operations.')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED: Mission Officers
-- ============================================

INSERT INTO mission_officers (employee_id, full_name, email, phone) VALUES
  ('ICP-FCA 001', 'Ahmed Al Mansoori', 'ahmed.mansoori@icpk9.ae', '+971 50 123 4001'),
  ('ICP-FCA 002', 'Mohammed Al Shamsi', 'mohammed.shamsi@icpk9.ae', '+971 50 123 4002'),
  ('ICP-FCA 003', 'Khalid Al Mazrouei', 'khalid.mazrouei@icpk9.ae', '+971 50 123 4003'),
  ('ICP-FCA 004', 'Rashid Al Nuaimi', 'rashid.nuaimi@icpk9.ae', '+971 50 123 4004'),
  ('ICP-FCA 005', 'Saeed Al Dhaheri', 'saeed.dhaheri@icpk9.ae', '+971 50 123 4005'),
  ('ICP-POL 001', 'Hassan Al Zaabi', 'hassan.zaabi@icpk9.ae', '+971 50 123 5001'),
  ('ICP-POL 002', 'Omar Al Ketbi', 'omar.ketbi@icpk9.ae', '+971 50 123 5002'),
  ('ICP-POL 003', 'Ali Al Qubaisi', 'ali.qubaisi@icpk9.ae', '+971 50 123 5003'),
  ('ICP-POL 004', 'Abdullah Al Suwaidi', 'abdullah.suwaidi@icpk9.ae', '+971 50 123 5004'),
  ('ICP-POL 005', 'Sultan Al Ameri', 'sultan.ameri@icpk9.ae', '+971 50 123 5005')
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================
-- SEED: Common Searchable Items
-- ============================================

INSERT INTO items (name, category) VALUES
  ('Bags', 'Luggage'),
  ('Suitcases', 'Luggage'),
  ('Backpacks', 'Luggage'),
  ('Vehicles', 'Transportation'),
  ('Cargo Containers', 'Transportation'),
  ('Parcels', 'Packages'),
  ('Mail', 'Packages'),
  ('Buildings', 'Structures'),
  ('Rooms', 'Structures'),
  ('Persons', 'People')
ON CONFLICT DO NOTHING;
