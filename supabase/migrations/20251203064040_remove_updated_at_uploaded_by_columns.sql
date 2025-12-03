/*
  # Remove updated_at and uploaded_by columns from deals table

  1. Changes
    - Remove `updated_at` column from `deals` table
    - Remove `uploaded_by` column from `deals` table
  
  2. Security
    - Update RLS policies to remove references to uploaded_by field
*/

-- Drop existing policies that reference uploaded_by
DROP POLICY IF EXISTS "Users can insert deals if email matches" ON deals;
DROP POLICY IF EXISTS "Users can update deals if email matches" ON deals;
DROP POLICY IF EXISTS "Users can delete deals if email matches" ON deals;

-- Drop the columns
ALTER TABLE deals DROP COLUMN IF EXISTS updated_at;
ALTER TABLE deals DROP COLUMN IF EXISTS uploaded_by;

-- Recreate policies without uploaded_by checks
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