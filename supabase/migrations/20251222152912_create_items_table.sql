/*
  # Create Items Table

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the searchable item
      - `category` (text, optional) - Category for grouping items
      - `description` (text, optional) - Additional details
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update
  
  2. Security
    - Enable RLS on `items` table
    - Add policy for authenticated users to read items
    - Add policy for authenticated users to manage items
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete items"
  ON items FOR DELETE
  TO authenticated
  USING (true);

-- Insert some common searchable items
INSERT INTO items (name, category) VALUES
  ('Bags', 'Luggage'),
  ('Suitcases', 'Luggage'),
  ('Backpacks', 'Luggage'),
  ('Vehicles', 'Transportation'),
  ('Cargo Containers', 'Transportation'),
  ('Parcels', 'Packages'),
  ('Mail', 'Packages'),
  ('Buildings', 'Structures'),
  ('Rooms', 'Structures'),
  ('Persons', 'People')
ON CONFLICT DO NOTHING;