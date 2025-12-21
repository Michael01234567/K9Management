/*
  # Add Team Leader and Driver Columns to Handlers

  1. Changes
    - Add `team_leader` boolean column to handlers table (default: false)
    - Add `driver` boolean column to handlers table (default: false)
    - Randomly assign 3 handlers as team leaders
    - Randomly assign 3 handlers as drivers
    - 2 handlers will have both team_leader and driver roles

  2. Notes
    - Boolean format (true/false) stored as yes/no in UI
    - Some handlers can have both roles simultaneously
*/

-- Add columns to handlers table
ALTER TABLE handlers 
ADD COLUMN IF NOT EXISTS team_leader boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS driver boolean DEFAULT false;

-- Get random handlers and assign roles
-- First, assign 3 team leaders (we'll use LIMIT with random ordering)
WITH random_team_leaders AS (
  SELECT id FROM handlers ORDER BY random() LIMIT 3
)
UPDATE handlers 
SET team_leader = true 
WHERE id IN (SELECT id FROM random_team_leaders);

-- Assign 3 drivers (will overlap with 2 team leaders)
WITH random_drivers AS (
  SELECT id FROM handlers ORDER BY random() LIMIT 3
)
UPDATE handlers 
SET driver = true 
WHERE id IN (SELECT id FROM random_drivers);
