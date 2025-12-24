/*
  # Fix Security and Performance Issues

  ## Overview
  This migration addresses critical security and performance issues identified in the database audit.

  ## Changes Made

  ### 1. Performance Improvements - Add Missing Indexes for Foreign Keys
  Foreign keys without covering indexes can cause significant performance degradation,
  especially as the database grows. Adding these indexes will optimize JOIN operations
  and foreign key constraint checks.

  New indexes added:
  - `idx_dogs_default_handler_id` - Improves queries joining dogs with their default handlers
  - `idx_dogs_location_id` - Optimizes location-based dog queries
  - `idx_fitness_status_handler_id` - Speeds up handler fitness status lookups
  - `idx_missions_driver_id` - Optimizes mission queries by driver
  - `idx_missions_mission_location_id` - Improves mission location joins
  - `idx_missions_mission_officer_id` - Speeds up mission officer queries
  - `idx_missions_team_leader_id` - Optimizes team leader mission lookups

  ### 2. Security Fix - Immutable Search Path for Functions
  The function `check_handler_officer_limit` had a mutable search_path which is a security risk.
  Functions with mutable search paths can be exploited through search_path manipulation attacks.
  
  Solution: Recreate the function with SET search_path = '' to make it immutable.

  ## Security Notes
  - All indexes use IF NOT EXISTS to prevent errors on re-run
  - Function is recreated with OR REPLACE to ensure security fix is applied
  - No data is modified, only performance and security metadata
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for dogs.default_handler_id
CREATE INDEX IF NOT EXISTS idx_dogs_default_handler_id 
ON dogs(default_handler_id) 
WHERE default_handler_id IS NOT NULL;

-- Index for dogs.location_id  
CREATE INDEX IF NOT EXISTS idx_dogs_location_id 
ON dogs(location_id) 
WHERE location_id IS NOT NULL;

-- Index for fitness_status.handler_id
CREATE INDEX IF NOT EXISTS idx_fitness_status_handler_id 
ON fitness_status(handler_id) 
WHERE handler_id IS NOT NULL;

-- Index for missions.driver_id
CREATE INDEX IF NOT EXISTS idx_missions_driver_id 
ON missions(driver_id) 
WHERE driver_id IS NOT NULL;

-- Index for missions.mission_location_id
CREATE INDEX IF NOT EXISTS idx_missions_mission_location_id 
ON missions(mission_location_id) 
WHERE mission_location_id IS NOT NULL;

-- Index for missions.mission_officer_id
CREATE INDEX IF NOT EXISTS idx_missions_mission_officer_id 
ON missions(mission_officer_id) 
WHERE mission_officer_id IS NOT NULL;

-- Index for missions.team_leader_id
CREATE INDEX IF NOT EXISTS idx_missions_team_leader_id 
ON missions(team_leader_id) 
WHERE team_leader_id IS NOT NULL;

-- =====================================================
-- PART 2: FIX FUNCTION SEARCH PATH SECURITY ISSUE
-- =====================================================

-- Recreate the function with an immutable search_path
-- This prevents search_path manipulation attacks
CREATE OR REPLACE FUNCTION public.check_handler_officer_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  dog_has_handler BOOLEAN;
BEGIN
  -- Check if this dog already has a handler
  SELECT EXISTS (
    SELECT 1 FROM public.dog_handler WHERE dog_id = NEW.dog_id
  ) INTO dog_has_handler;

  -- If dog has a handler, prevent officer assignment
  IF dog_has_handler THEN
    RAISE EXCEPTION 'Cannot assign officer to dog %. This dog already has a handler assigned.', NEW.dog_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the trigger still exists and uses the updated function
DROP TRIGGER IF EXISTS enforce_handler_officer_limit ON public.dog_officer;
CREATE TRIGGER enforce_handler_officer_limit
  BEFORE INSERT OR UPDATE ON public.dog_officer
  FOR EACH ROW
  EXECUTE FUNCTION public.check_handler_officer_limit();
