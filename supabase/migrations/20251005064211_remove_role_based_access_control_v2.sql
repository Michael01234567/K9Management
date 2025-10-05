/*
  # Remove Role-Based Access Control

  ## Overview
  This migration removes all role-based access control policies and replaces them with
  simple authenticated user policies that allow all authenticated users full access.

  ## 1. Changes
  - Drop all role-based RLS policies first
  - Drop the get_user_role() helper function
  - Create new simple authenticated user policies
  - All authenticated users can now perform all CRUD operations

  ## 2. Security
  - RLS remains enabled on all tables
  - Only authenticated users can access data
  - No role-based restrictions

  ## 3. Important Notes
  - This simplifies the access control model
  - All authenticated users have equal permissions
*/

-- ============================================
-- DOGS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Dogs are viewable by authenticated users" ON dogs;
DROP POLICY IF EXISTS "Only admins can insert dogs" ON dogs;
DROP POLICY IF EXISTS "Only admins can update dogs" ON dogs;
DROP POLICY IF EXISTS "Only admins can delete dogs" ON dogs;

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

-- ============================================
-- HANDLERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Handlers are viewable by authenticated users" ON handlers;
DROP POLICY IF EXISTS "Only admins can insert handlers" ON handlers;
DROP POLICY IF EXISTS "Only admins can update handlers" ON handlers;
DROP POLICY IF EXISTS "Only admins can delete handlers" ON handlers;

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

-- ============================================
-- DOG_HANDLER TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Dog-handler relationships are viewable by authenticated users" ON dog_handler;
DROP POLICY IF EXISTS "Only admins can assign handlers to dogs" ON dog_handler;
DROP POLICY IF EXISTS "Only admins can remove handler assignments" ON dog_handler;

CREATE POLICY "Authenticated users can view dog-handler relationships"
  ON dog_handler FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can assign handlers"
  ON dog_handler FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update assignments"
  ON dog_handler FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can remove assignments"
  ON dog_handler FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- VET_RECORDS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Vet records are viewable by authenticated users" ON vet_records;
DROP POLICY IF EXISTS "Admins, handlers, and vets can create vet records" ON vet_records;
DROP POLICY IF EXISTS "Admins, handlers, and vets can update vet records" ON vet_records;
DROP POLICY IF EXISTS "Admins and vets can delete vet records" ON vet_records;

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
-- FITNESS_LOGS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Fitness logs are viewable by authenticated users" ON fitness_logs;
DROP POLICY IF EXISTS "Admins, handlers, and vets can create fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Admins, handlers, and vets can update fitness logs" ON fitness_logs;
DROP POLICY IF EXISTS "Only admins can delete fitness logs" ON fitness_logs;

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

-- ============================================
-- FITNESS_STATUS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Fitness status viewable by authenticated users" ON fitness_status;
DROP POLICY IF EXISTS "Admins, handlers, and vets can create fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Admins, handlers, and vets can update fitness status" ON fitness_status;
DROP POLICY IF EXISTS "Only admins can delete fitness status" ON fitness_status;

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

-- Drop the role-based helper function now that policies are updated
DROP FUNCTION IF EXISTS get_user_role() CASCADE;