/*
  # Create Deals Table for Data Import

  1. New Tables
    - `deals`
      - `id` (uuid, primary key) - Unique identifier for each deal
      - `opportunity_owner` (text) - Name of the person owning the opportunity
      - `created` (date) - Date when the opportunity was created
      - `opportunity` (text) - Name/description of the opportunity
      - `account` (text) - Account name
      - `business` (text) - Business unit
      - `division` (text) - Division name
      - `deal_value` (numeric) - Total deal value
      - `gross_margin` (numeric) - Gross margin amount
      - `gross_margin_percent` (numeric) - Gross margin percentage
      - `probability` (numeric) - Probability of closing (0-100)
      - `forecast` (text) - Forecast category
      - `stage` (text) - Current stage of the deal
      - `forecast_close_date` (date) - Expected closing date
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp
      - `uploaded_by` (uuid) - User who uploaded this record

  2. Security
    - Enable RLS on `deals` table
    - Add policy for authenticated users to read deals
    - Add policy for Nadeen Habboub to insert/update/delete deals
    
  3. Notes
    - Only Nadeen Habboub (nadeen.habboub@optimizo.me) can upload and manage deals data
    - All authenticated users can view deals data
*/

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_owner text,
  created date,
  opportunity text,
  account text,
  business text,
  division text,
  deal_value numeric,
  gross_margin numeric,
  gross_margin_percent numeric,
  probability numeric,
  forecast text,
  stage text,
  forecast_close_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deals"
  ON deals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Nadeen Habboub can insert deals"
  ON deals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nadeen.habboub@optimizo.me'
    )
  );

CREATE POLICY "Nadeen Habboub can update deals"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nadeen.habboub@optimizo.me'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nadeen.habboub@optimizo.me'
    )
  );

CREATE POLICY "Nadeen Habboub can delete deals"
  ON deals
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nadeen.habboub@optimizo.me'
    )
  );

CREATE INDEX IF NOT EXISTS idx_deals_uploaded_by ON deals(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_deals_created ON deals(created);
CREATE INDEX IF NOT EXISTS idx_deals_forecast_close_date ON deals(forecast_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business);
CREATE INDEX IF NOT EXISTS idx_deals_division ON deals(division);
