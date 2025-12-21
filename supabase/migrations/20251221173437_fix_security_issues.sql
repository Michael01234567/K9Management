/*
  # Fix Security Issues

  ## Changes Made

  1. **Remove Unused Indexes**
    - Drop `idx_fitness_status_handler_id` from `fitness_status` table (not being used)
    - Drop `idx_dogs_location_id` from `dogs` table (not being used)
    - Drop `idx_dog_officer_officer_id` from `dog_officer` table (not being used)

  2. **Fix Function Search Path**
    - Recreate `create_default_fitness_status` function with immutable search_path
    - Set explicit search_path to prevent security vulnerabilities
    - Ensures function cannot be exploited through search_path manipulation

  ## Security Notes
    - Removing unused indexes improves database performance and reduces maintenance overhead
    - Fixed search_path prevents potential privilege escalation attacks
    - Function now uses SECURITY INVOKER with explicit schema qualification
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_fitness_status_handler_id;
DROP INDEX IF EXISTS idx_dogs_location_id;
DROP INDEX IF EXISTS idx_dog_officer_officer_id;

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION public.create_default_fitness_status()
RETURNS TRIGGER 
SECURITY INVOKER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.fitness_status (dog_id, weight_kg, status)
  VALUES (NEW.id, NEW.weight_kg, 'Fit');
  RETURN NEW;
END;
$$;