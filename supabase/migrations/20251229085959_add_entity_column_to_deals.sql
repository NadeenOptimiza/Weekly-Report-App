/*
  # Add Entity Column to Deals Table

  1. New Columns
    - `Entity` (text, nullable) - Identifies the geographic entity for the deal
      - Values: "Jordan", "KSA", or NULL
      - KSA deals typically have USD values that need conversion to JOD

  2. Notes
    - This column allows filtering deals by geographic region
    - USD values in KSA deals should be converted to JOD (multiply by 0.71)
    - No foreign key constraint - simple text field for flexibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'Entity'
  ) THEN
    ALTER TABLE deals ADD COLUMN "Entity" text;
  END IF;
END $$;