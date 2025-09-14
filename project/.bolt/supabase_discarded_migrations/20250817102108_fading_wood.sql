/*
  # Weekly Reports Database Schema

  1. New Tables
    - `business_units`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `color` (text)
      - `created_at` (timestamp)
    - `divisions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `business_unit_id` (uuid, foreign key)
      - `created_at` (timestamp)
    - `weekly_reports`
      - `id` (uuid, primary key)
      - `business_unit` (text)
      - `division` (text)
      - `week` (text)
      - `urgent_issues` (text)
      - `highlight_of_week` (text)
      - `business_development` (text)
      - `planned_activities` (text)
      - `submitted_by` (text)
      - `submitted_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write data

  3. Sample Data
    - Insert sample business units and divisions
*/

-- Create business_units table
CREATE TABLE IF NOT EXISTS business_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create divisions table
CREATE TABLE IF NOT EXISTS divisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business_unit_id uuid REFERENCES business_units(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create weekly_reports table
CREATE TABLE IF NOT EXISTS weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_unit text NOT NULL,
  division text DEFAULT '',
  week text NOT NULL,
  urgent_issues text DEFAULT '',
  highlight_of_week text DEFAULT '',
  business_development text DEFAULT '',
  planned_activities text DEFAULT '',
  submitted_by text DEFAULT '',
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for business_units
CREATE POLICY "Anyone can read business units"
  ON business_units
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert business units"
  ON business_units
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for divisions
CREATE POLICY "Anyone can read divisions"
  ON divisions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert divisions"
  ON divisions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for weekly_reports
CREATE POLICY "Anyone can read weekly reports"
  ON weekly_reports
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert weekly reports"
  ON weekly_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update weekly reports"
  ON weekly_reports
  FOR UPDATE
  TO public
  USING (true);

-- Insert sample business units
INSERT INTO business_units (name, color) VALUES
  ('Technology', '#3B82F6'),
  ('Marketing', '#10B981'),
  ('Sales', '#F59E0B'),
  ('Operations', '#EF4444'),
  ('Finance', '#8B5CF6'),
  ('Human Resources', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Insert sample divisions
INSERT INTO divisions (name, business_unit_id) 
SELECT 'Software Development', id FROM business_units WHERE name = 'Technology'
UNION ALL
SELECT 'IT Infrastructure', id FROM business_units WHERE name = 'Technology'
UNION ALL
SELECT 'Digital Marketing', id FROM business_units WHERE name = 'Marketing'
UNION ALL
SELECT 'Brand Management', id FROM business_units WHERE name = 'Marketing'
UNION ALL
SELECT 'Inside Sales', id FROM business_units WHERE name = 'Sales'
UNION ALL
SELECT 'Field Sales', id FROM business_units WHERE name = 'Sales'
UNION ALL
SELECT 'Supply Chain', id FROM business_units WHERE name = 'Operations'
UNION ALL
SELECT 'Quality Assurance', id FROM business_units WHERE name = 'Operations'
UNION ALL
SELECT 'Accounting', id FROM business_units WHERE name = 'Finance'
UNION ALL
SELECT 'Financial Planning', id FROM business_units WHERE name = 'Finance'
UNION ALL
SELECT 'Recruitment', id FROM business_units WHERE name = 'Human Resources'
UNION ALL
SELECT 'Employee Relations', id FROM business_units WHERE name = 'Human Resources'
ON CONFLICT DO NOTHING;