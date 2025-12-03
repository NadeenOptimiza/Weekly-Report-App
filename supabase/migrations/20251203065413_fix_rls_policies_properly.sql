/*
  # Fix RLS Policies for Deals Table

  1. Changes
    - Drop all existing policies with correct names
    - Create new policies allowing all authenticated users to manage deals
  
  2. Security
    - All authenticated users can insert, update, and delete deals
    - RLS remains enabled for security
*/

-- Drop all existing policies by their actual names
DROP POLICY IF EXISTS "Nadeen Habboub can insert deals" ON deals;
DROP POLICY IF EXISTS "Nadeen Habboub can update deals" ON deals;
DROP POLICY IF EXISTS "Nadeen Habboub can delete deals" ON deals;
DROP POLICY IF EXISTS "Authenticated users can insert deals" ON deals;
DROP POLICY IF EXISTS "Authenticated users can update deals" ON deals;
DROP POLICY IF EXISTS "Authenticated users can delete deals" ON deals;

-- Create new permissive policies for all authenticated users
CREATE POLICY "Authenticated users can insert deals"
  ON deals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update deals"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete deals"
  ON deals
  FOR DELETE
  TO authenticated
  USING (true);