/*
  # Create Missions Table

  1. New Tables
    - `missions`
      - `id` (uuid, primary key)
      - `date` (date) - Mission date
      - `mission_location_id` (uuid, foreign key) - Reference to mission_locations table
      - `departure_time` (time) - Time of departure
      - `return_time` (time) - Time of return
      - `explosive_dog_ids` (uuid[]) - Array of dog IDs for explosive detection
      - `narcotic_dog_ids` (uuid[]) - Array of dog IDs for narcotic detection
      - `handler_ids` (uuid[]) - Array of handler IDs
      - `mission_officer_id` (uuid, foreign key) - Reference to mission_officers table
      - `team_leader_id` (uuid, foreign key) - Reference to handlers table (must be team leader)
      - `driver_id` (uuid, foreign key) - Reference to handlers table (must be driver)
      - `training` (boolean) - Whether this is a training mission
      - `search` (boolean) - Whether this is a search mission
      - `num_items_searched` (integer) - Number of items searched
      - `items_searched_ids` (uuid[]) - Array of item IDs that were searched
      - `comments` (text) - Additional notes/comments
      - `status` (text) - Mission status: Active, On Standby, Emergency, Cancelled
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update
  
  2. Security
    - Enable RLS on `missions` table
    - Add policies for authenticated users to manage missions
*/

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
  comments text,
  status text DEFAULT 'Active' CHECK (status IN ('Active', 'On Standby', 'Emergency', 'Cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read missions"
  ON missions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert missions"
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update missions"
  ON missions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete missions"
  ON missions FOR DELETE
  TO authenticated
  USING (true);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_missions_date ON missions(date);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);