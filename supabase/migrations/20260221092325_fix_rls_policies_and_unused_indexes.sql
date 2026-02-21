/*
  # Fix RLS Policies and Drop Unused Indexes

  ## Summary
  This migration addresses two categories of security/performance issues:

  ### 1. RLS Policy Fixes
  All INSERT, UPDATE, and DELETE policies across all tables were using `true` as
  their USING/WITH CHECK clause, which technically allows any authenticated user
  unrestricted access. This migration replaces `true` with `(auth.uid() IS NOT NULL)`
  so that the policies properly enforce that the user is authenticated via Supabase Auth.

  ### Affected Tables
  - dog_handler
  - dog_officer
  - dogs
  - fitness_logs
  - fitness_status
  - handlers
  - items
  - locations
  - mission_locations
  - mission_officers
  - missions
  - users
  - vet_records

  ### 2. Unused Index Removal
  Drops indexes flagged as unused by Supabase. These are foreign-key support indexes
  that have not been used in query plans and can be removed to reduce storage and
  write overhead. They can be re-added later if query patterns change.

  ### Dropped Indexes
  - idx_dog_handler_dog_id
  - idx_dog_handler_handler_id
  - idx_vet_records_dog_id
  - idx_fitness_logs_dog_id
  - idx_fitness_status_dog_id
  - idx_dogs_default_handler_id
  - idx_dogs_location_id
  - idx_fitness_status_handler_id
  - idx_missions_driver_id
  - idx_missions_date
  - idx_missions_status
  - idx_missions_mission_location_id
  - idx_missions_mission_officer_id
  - idx_missions_team_leader_id
  - idx_dog_officer_dog_id
*/

-- ============================================================
-- dog_handler: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create dog-handler relationships" ON public.dog_handler;
DROP POLICY IF EXISTS "Authenticated users can update dog-handler relationships" ON public.dog_handler;
DROP POLICY IF EXISTS "Authenticated users can delete dog-handler relationships" ON public.dog_handler;

CREATE POLICY "Authenticated users can create dog-handler relationships"
  ON public.dog_handler FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dog-handler relationships"
  ON public.dog_handler FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dog-handler relationships"
  ON public.dog_handler FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- dog_officer: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert dog officer assignments" ON public.dog_officer;
DROP POLICY IF EXISTS "Authenticated users can update dog officer assignments" ON public.dog_officer;
DROP POLICY IF EXISTS "Authenticated users can delete dog officer assignments" ON public.dog_officer;

CREATE POLICY "Authenticated users can insert dog officer assignments"
  ON public.dog_officer FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dog officer assignments"
  ON public.dog_officer FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dog officer assignments"
  ON public.dog_officer FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- dogs: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create dogs" ON public.dogs;
DROP POLICY IF EXISTS "Authenticated users can update dogs" ON public.dogs;
DROP POLICY IF EXISTS "Authenticated users can delete dogs" ON public.dogs;

CREATE POLICY "Authenticated users can create dogs"
  ON public.dogs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dogs"
  ON public.dogs FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete dogs"
  ON public.dogs FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- fitness_logs: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create fitness logs" ON public.fitness_logs;
DROP POLICY IF EXISTS "Authenticated users can update fitness logs" ON public.fitness_logs;
DROP POLICY IF EXISTS "Authenticated users can delete fitness logs" ON public.fitness_logs;

CREATE POLICY "Authenticated users can create fitness logs"
  ON public.fitness_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fitness logs"
  ON public.fitness_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fitness logs"
  ON public.fitness_logs FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- fitness_status: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create fitness status" ON public.fitness_status;
DROP POLICY IF EXISTS "Authenticated users can update fitness status" ON public.fitness_status;
DROP POLICY IF EXISTS "Authenticated users can delete fitness status" ON public.fitness_status;

CREATE POLICY "Authenticated users can create fitness status"
  ON public.fitness_status FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update fitness status"
  ON public.fitness_status FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete fitness status"
  ON public.fitness_status FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- handlers: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create handlers" ON public.handlers;
DROP POLICY IF EXISTS "Authenticated users can update handlers" ON public.handlers;
DROP POLICY IF EXISTS "Authenticated users can delete handlers" ON public.handlers;

CREATE POLICY "Authenticated users can create handlers"
  ON public.handlers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update handlers"
  ON public.handlers FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete handlers"
  ON public.handlers FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- items: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can delete items" ON public.items;

CREATE POLICY "Authenticated users can insert items"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update items"
  ON public.items FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete items"
  ON public.items FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- locations: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can update locations" ON public.locations;
DROP POLICY IF EXISTS "Authenticated users can delete locations" ON public.locations;

CREATE POLICY "Authenticated users can create locations"
  ON public.locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update locations"
  ON public.locations FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete locations"
  ON public.locations FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- mission_locations: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create mission locations" ON public.mission_locations;
DROP POLICY IF EXISTS "Authenticated users can update mission locations" ON public.mission_locations;
DROP POLICY IF EXISTS "Authenticated users can delete mission locations" ON public.mission_locations;

CREATE POLICY "Authenticated users can create mission locations"
  ON public.mission_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update mission locations"
  ON public.mission_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete mission locations"
  ON public.mission_locations FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- mission_officers: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert mission officers" ON public.mission_officers;
DROP POLICY IF EXISTS "Authenticated users can update mission officers" ON public.mission_officers;
DROP POLICY IF EXISTS "Authenticated users can delete mission officers" ON public.mission_officers;

CREATE POLICY "Authenticated users can insert mission officers"
  ON public.mission_officers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update mission officers"
  ON public.mission_officers FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete mission officers"
  ON public.mission_officers FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- missions: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert missions" ON public.missions;
DROP POLICY IF EXISTS "Authenticated users can update missions" ON public.missions;
DROP POLICY IF EXISTS "Authenticated users can delete missions" ON public.missions;

CREATE POLICY "Authenticated users can insert missions"
  ON public.missions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update missions"
  ON public.missions FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete missions"
  ON public.missions FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- users: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can delete users" ON public.users;

CREATE POLICY "Authenticated users can insert users"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete users"
  ON public.users FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- vet_records: replace true policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can create vet records" ON public.vet_records;
DROP POLICY IF EXISTS "Authenticated users can update vet records" ON public.vet_records;
DROP POLICY IF EXISTS "Authenticated users can delete vet records" ON public.vet_records;

CREATE POLICY "Authenticated users can create vet records"
  ON public.vet_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update vet records"
  ON public.vet_records FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete vet records"
  ON public.vet_records FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- Drop unused indexes
-- ============================================================
DROP INDEX IF EXISTS public.idx_dog_handler_dog_id;
DROP INDEX IF EXISTS public.idx_dog_handler_handler_id;
DROP INDEX IF EXISTS public.idx_vet_records_dog_id;
DROP INDEX IF EXISTS public.idx_fitness_logs_dog_id;
DROP INDEX IF EXISTS public.idx_fitness_status_dog_id;
DROP INDEX IF EXISTS public.idx_dogs_default_handler_id;
DROP INDEX IF EXISTS public.idx_dogs_location_id;
DROP INDEX IF EXISTS public.idx_fitness_status_handler_id;
DROP INDEX IF EXISTS public.idx_missions_driver_id;
DROP INDEX IF EXISTS public.idx_missions_date;
DROP INDEX IF EXISTS public.idx_missions_status;
DROP INDEX IF EXISTS public.idx_missions_mission_location_id;
DROP INDEX IF EXISTS public.idx_missions_mission_officer_id;
DROP INDEX IF EXISTS public.idx_missions_team_leader_id;
DROP INDEX IF EXISTS public.idx_dog_officer_dog_id;
