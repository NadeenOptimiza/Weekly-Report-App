/*
  # Add Forecast Year Column to Deals Table

  1. Changes
    - Add `forecast_year` column to `deals` table
      - Type: text (to handle values like "2024", "2025", etc.)
      - Allows null values for backward compatibility
    
  2. Performance
    - Create index on `forecast_year` for filtering and reporting queries

  3. Notes
    - This completes the mapping of all 14 Excel columns:
      1. Opportunity Owner → opportunity_owner
      2. Created Date → created
      3. Opportunity Name → opportunity
      4. Account Name → account
      5. Business Unit → business
      6. Division → division
      7. Deal Value → deal_value
      8. Gross Margin % → gross_margin_percent
      9. Gross Margin Value → gross_margin
      10. Probability (%) → probability
      11. Forecast Level → forecast
      12. Stage → stage
      13. Forecast Year → forecast_year (NEW)
      14. Close Date → forecast_close_date
*/

-- Add forecast_year column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'forecast_year'
  ) THEN
    ALTER TABLE deals ADD COLUMN forecast_year text;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_deals_forecast_year ON deals(forecast_year);