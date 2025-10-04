/*
  # Add Role-Based Access Control with RLS Policies

  ## Overview
  This migration implements role-based access control (RBAC) using Row Level Security (RLS) policies.
  Different user roles have different permissions for viewing and modifying data.

  ## Role Permissions

  ### Admin
  - Full access to all tables (SELECT, INSERT, UPDATE, DELETE)
  - Can manage dogs, handlers, vet records, and fitness logs

  ### Handler
  - Can view all dogs, handlers, vet records, and fitness logs (SELECT)
  - Can add and update vet records and fitness logs (INSERT, UPDATE)
  - Cannot delete any records
  - Cannot modify dog or handler information

  ### Veterinarian
  - Can view all dogs, handlers, vet records, and fitness logs (SELECT)
  - Can add, update, and delete vet records (INSERT, UPDATE, DELETE)
  - Can add and update fitness logs (INSERT, UPDATE)
  - Cannot modify dog or handler information

  ### Viewer
  - Read-only access to all data (SELECT only)
  - Cannot modify any records

  ## 1. Helper Function
  - Create function to get current user's role from users table

  ## 2. Security
  - Update RLS policies on dogs, handlers, dog_handler, vet_records, and fitness_logs tables
  - Policies check user role to determine permissions
*/

-- Create helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- DOGS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to dogs" ON dogs;
DROP POLICY IF EXISTS "Allow insert for admins" ON dogs;
DROP POLICY IF EXISTS "Allow update for admins" ON dogs;
DROP POLICY IF EXISTS "Allow delete for admins" ON dogs;

-- Dogs: SELECT - All authenticated users can view
CREATE POLICY "Dogs are viewable by authenticated users"
  ON dogs FOR SELECT
  TO authenticated
  USING (true);

-- Dogs: INSERT - Only Admins
CREATE POLICY "Only admins can insert dogs"
  ON dogs FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'Admin');

-- Dogs: UPDATE - Only Admins
CREATE POLICY "Only admins can update dogs"
  ON dogs FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'Admin')
  WITH CHECK (get_user_role() = 'Admin');

-- Dogs: DELETE - Only Admins
CREATE POLICY "Only admins can delete dogs"
  ON dogs FOR DELETE
  TO authenticated
  USING (get_user_role() = 'Admin');

-- ============================================
-- HANDLERS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to handlers" ON handlers;
DROP POLICY IF EXISTS "Allow insert for admins" ON handlers;
DROP POLICY IF EXISTS "Allow update for admins" ON handlers;
DROP POLICY IF EXISTS "Allow delete for admins" ON handlers;

-- Handlers: SELECT - All authenticated users can view
CREATE POLICY "Handlers are viewable by authenticated users"
  ON handlers FOR SELECT
  TO authenticated
  USING (true);

-- Handlers: INSERT - Only Admins
CREATE POLICY "Only admins can insert handlers"
  ON handlers FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'Admin');

-- Handlers: UPDATE - Only Admins
CREATE POLICY "Only admins can update handlers"
  ON handlers FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'Admin')
  WITH CHECK (get_user_role() = 'Admin');

-- Handlers: DELETE - Only Admins
CREATE POLICY "Only admins can delete handlers"
  ON handlers FOR DELETE
  TO authenticated
  USING (get_user_role() = 'Admin');

-- ============================================
-- DOG_HANDLER TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to dog_handler" ON dog_handler;
DROP POLICY IF EXISTS "Allow insert for admins" ON dog_handler;
DROP POLICY IF EXISTS "Allow delete for admins" ON dog_handler;

-- Dog_Handler: SELECT - All authenticated users can view
CREATE POLICY "Dog-handler relationships are viewable by authenticated users"
  ON dog_handler FOR SELECT
  TO authenticated
  USING (true);

-- Dog_Handler: INSERT - Only Admins
CREATE POLICY "Only admins can assign handlers to dogs"
  ON dog_handler FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'Admin');

-- Dog_Handler: DELETE - Only Admins
CREATE POLICY "Only admins can remove handler assignments"
  ON dog_handler FOR DELETE
  TO authenticated
  USING (get_user_role() = 'Admin');

-- ============================================
-- VET_RECORDS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to vet_records" ON vet_records;
DROP POLICY IF EXISTS "Allow insert for handlers and vets" ON vet_records;
DROP POLICY IF EXISTS "Allow update for handlers and vets" ON vet_records;
DROP POLICY IF EXISTS "Allow delete for vets" ON vet_records;

-- Vet_Records: SELECT - All authenticated users can view
CREATE POLICY "Vet records are viewable by authenticated users"
  ON vet_records FOR SELECT
  TO authenticated
  USING (true);

-- Vet_Records: INSERT - Admins, Handlers, Veterinarians
CREATE POLICY "Admins, handlers, and vets can create vet records"
  ON vet_records FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'));

-- Vet_Records: UPDATE - Admins, Handlers, Veterinarians
CREATE POLICY "Admins, handlers, and vets can update vet records"
  ON vet_records FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'))
  WITH CHECK (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'));

-- Vet_Records: DELETE - Admins and Veterinarians only
CREATE POLICY "Admins and vets can delete vet records"
  ON vet_records FOR DELETE
  TO authenticated
  USING (get_user_role() IN ('Admin', 'Veterinarian'));

-- ============================================
-- FITNESS_LOGS TABLE POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow read access to fitness_logs" ON fitness_logs;
DROP POLICY IF EXISTS "Allow insert for handlers and vets" ON fitness_logs;
DROP POLICY IF EXISTS "Allow update for handlers and vets" ON fitness_logs;
DROP POLICY IF EXISTS "Allow delete for admins" ON fitness_logs;

-- Fitness_Logs: SELECT - All authenticated users can view
CREATE POLICY "Fitness logs are viewable by authenticated users"
  ON fitness_logs FOR SELECT
  TO authenticated
  USING (true);

-- Fitness_Logs: INSERT - Admins, Handlers, Veterinarians
CREATE POLICY "Admins, handlers, and vets can create fitness logs"
  ON fitness_logs FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'));

-- Fitness_Logs: UPDATE - Admins, Handlers, Veterinarians
CREATE POLICY "Admins, handlers, and vets can update fitness logs"
  ON fitness_logs FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'))
  WITH CHECK (get_user_role() IN ('Admin', 'Handler', 'Veterinarian'));

-- Fitness_Logs: DELETE - Admins only
CREATE POLICY "Only admins can delete fitness logs"
  ON fitness_logs FOR DELETE
  TO authenticated
  USING (get_user_role() = 'Admin');