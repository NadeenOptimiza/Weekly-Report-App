/*
  # Update Deals Table RLS Policies for Correct Email

  1. Changes
    - Drop existing policies
    - Recreate policies with correct email: nhabboub@optimizasolutions.com
  
  2. Security
    - Only Nadeen Habboub (nhabboub@optimizasolutions.com) can insert/update/delete deals
    - All authenticated users can view deals
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Nadeen Habboub can insert deals" ON deals;
DROP POLICY IF EXISTS "Nadeen Habboub can update deals" ON deals;
DROP POLICY IF EXISTS "Nadeen Habboub can delete deals" ON deals;

-- Recreate policies with correct email
CREATE POLICY "Nadeen Habboub can insert deals"
  ON deals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nhabboub@optimizasolutions.com'
    )
  );

CREATE POLICY "Nadeen Habboub can update deals"
  ON deals
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nhabboub@optimizasolutions.com'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nhabboub@optimizasolutions.com'
    )
  );

CREATE POLICY "Nadeen Habboub can delete deals"
  ON deals
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'nhabboub@optimizasolutions.com'
    )
  );
