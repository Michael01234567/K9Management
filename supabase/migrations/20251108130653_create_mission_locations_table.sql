/*
  # Create Mission Locations Table

  ## Overview
  This migration creates a mission_locations table to manage physical locations for 
  mission assignments and operations, with support for geographic coordinates.

  ## 1. New Tables

  ### mission_locations
  - `id` (uuid, primary key) - Unique mission location identifier
  - `name` (text, required) - Mission location name
  - `address` (text, optional) - Physical address
  - `latitude` (numeric, optional) - Geographic latitude
  - `longitude` (numeric, optional) - Geographic longitude
  - `description` (text, optional) - Additional details about the mission location
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Indexes
  - Unique constraint on mission location name to prevent duplicates

  ## 3. Security
  - RLS is DISABLED for simplified access

  ## 4. Important Notes
  - This table mirrors the structure of the locations table
  - Used specifically for mission-related locations
*/

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
-- DISABLE RLS
-- ============================================

ALTER TABLE mission_locations DISABLE ROW LEVEL SECURITY;