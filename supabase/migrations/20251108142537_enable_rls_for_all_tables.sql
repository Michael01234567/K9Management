/*
  # Enable Row Level Security for All Tables
  
  ## Overview
  This migration enables Row Level Security (RLS) on all tables and creates
  permissive policies for authenticated users to access all data. This is 
  appropriate for an internal K9 management system where all authenticated
  users need access to all records.
  
  ## 1. Tables with RLS Enabled
  - fitness_status
  - users
  - locations
  - mission_locations
  - handlers
  - dogs
  - dog_handler
  - vet_records
  - fitness_logs
  
  ## 2. Security Model
  - All authenticated users can perform all operations (SELECT, INSERT, UPDATE, DELETE)
  - Unauthenticated users have no access
  - This is suitable for an internal application where all team members need full access
  
  ## 3. Important Notes
  - RLS is now enabled and enforced on all tables
  - Only authenticated users via Supabase Auth can access the data
  - The anon key will work for authenticated sessions only
*/

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