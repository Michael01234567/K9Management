/*
  # Create Mission Officers Table

  1. New Tables
    - `mission_officers`
      - `id` (uuid, primary key) - Unique identifier for each mission officer
      - `employee_id` (text, unique) - Employee identification number (e.g., ICP-FCA 001)
      - `full_name` (text) - Full name of the mission officer
      - `email` (text, nullable) - Email address
      - `phone` (text, nullable) - Phone number
      - `picture_url` (text, nullable) - URL to profile picture
      - `created_at` (timestamptz) - Timestamp when record was created
      - `updated_at` (timestamptz) - Timestamp when record was last updated

  2. Security
    - Enable RLS on `mission_officers` table
    - Add policy for authenticated users to read all mission officers
    - Add policy for authenticated users to insert mission officers
    - Add policy for authenticated users to update mission officers
    - Add policy for authenticated users to delete mission officers

  3. Sample Data
    - Add 5 officers with ICP-FCA employee IDs (001-005)
    - Add 5 officers with ICP-POL employee IDs (001-005)
*/

CREATE TABLE IF NOT EXISTS mission_officers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mission_officers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mission officers"
  ON mission_officers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert mission officers"
  ON mission_officers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update mission officers"
  ON mission_officers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete mission officers"
  ON mission_officers
  FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO mission_officers (employee_id, full_name, email, phone) VALUES
  ('ICP-FCA 001', 'Ahmed Al Mansoori', 'ahmed.mansoori@icpk9.ae', '+971 50 123 4001'),
  ('ICP-FCA 002', 'Mohammed Al Shamsi', 'mohammed.shamsi@icpk9.ae', '+971 50 123 4002'),
  ('ICP-FCA 003', 'Khalid Al Mazrouei', 'khalid.mazrouei@icpk9.ae', '+971 50 123 4003'),
  ('ICP-FCA 004', 'Rashid Al Nuaimi', 'rashid.nuaimi@icpk9.ae', '+971 50 123 4004'),
  ('ICP-FCA 005', 'Saeed Al Dhaheri', 'saeed.dhaheri@icpk9.ae', '+971 50 123 4005'),
  ('ICP-POL 001', 'Hassan Al Zaabi', 'hassan.zaabi@icpk9.ae', '+971 50 123 5001'),
  ('ICP-POL 002', 'Omar Al Ketbi', 'omar.ketbi@icpk9.ae', '+971 50 123 5002'),
  ('ICP-POL 003', 'Ali Al Qubaisi', 'ali.qubaisi@icpk9.ae', '+971 50 123 5003'),
  ('ICP-POL 004', 'Abdullah Al Suwaidi', 'abdullah.suwaidi@icpk9.ae', '+971 50 123 5004'),
  ('ICP-POL 005', 'Sultan Al Ameri', 'sultan.ameri@icpk9.ae', '+971 50 123 5005');
