/*
  # Rename Division and Stage Columns

  1. Changes
    - Rename division → "Division"
    - Rename stage → "Stage"
    
  2. Reason
    - These columns were missed in the previous column rename migration
    - Need to match Excel headers for data import
*/

-- Rename the remaining columns to match Excel headers
ALTER TABLE deals RENAME COLUMN division TO "Division";
ALTER TABLE deals RENAME COLUMN stage TO "Stage";