/*
  # Create Locations Table

  ## Overview
  This migration creates a locations table to manage physical locations for dog assignments
  and operations, with support for geographic coordinates.

  ## 1. New Tables

  ### locations
  - `id` (uuid, primary key) - Unique location identifier
  - `name` (text, required) - Location name
  - `address` (text, optional) - Physical address
  - `latitude` (numeric, optional) - Geographic latitude
  - `longitude` (numeric, optional) - Geographic longitude
  - `description` (text, optional) - Additional details about the location
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Indexes
  - Unique constraint on location name to prevent duplicates

  ## 3. Security
  - RLS is DISABLED for simplified access

  ## 4. Data Migration
  - Extract unique locations from dogs table and populate locations table
*/

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
-- DISABLE RLS
-- ============================================

ALTER TABLE locations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- POPULATE WITH EXISTING LOCATIONS FROM DOGS
-- ============================================

INSERT INTO locations (name, description)
SELECT DISTINCT location, 'Migrated from dogs table'
FROM dogs
WHERE location IS NOT NULL AND location != ''
ON CONFLICT (name) DO NOTHING;