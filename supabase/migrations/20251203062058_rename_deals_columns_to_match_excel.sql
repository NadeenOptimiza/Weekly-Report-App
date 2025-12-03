/*
  # Rename Deals Table Columns to Match Excel Headers

  1. Changes
    - Rename all columns to match Excel headers exactly (with spaces and special characters)
    - Preserve all data during rename operations
    
  2. Column Mappings
    - opportunity_owner → "Opportunity Owner"
    - created → "Created Date"
    - opportunity → "Opportunity Name"
    - account → "Account Name"
    - business → "Business Unit"
    - division → "Division" (no change)
    - deal_value → "Deal Value"
    - gross_margin_percent → "Gross Margin %"
    - gross_margin → "Gross Margin Value"
    - probability → "Probability (%)"
    - forecast → "Forecast Level"
    - stage → "Stage" (no change)
    - forecast_year → "Forecast Year"
    - forecast_close_date → "Close Date"
    
  3. Notes
    - System columns (id, created_at, updated_at, uploaded_by) remain unchanged
    - All indexes will be automatically updated
    - RLS policies will continue to work
*/

-- Rename columns to match Excel headers exactly
ALTER TABLE deals RENAME COLUMN opportunity_owner TO "Opportunity Owner";
ALTER TABLE deals RENAME COLUMN created TO "Created Date";
ALTER TABLE deals RENAME COLUMN opportunity TO "Opportunity Name";
ALTER TABLE deals RENAME COLUMN account TO "Account Name";
ALTER TABLE deals RENAME COLUMN business TO "Business Unit";
ALTER TABLE deals RENAME COLUMN deal_value TO "Deal Value";
ALTER TABLE deals RENAME COLUMN gross_margin_percent TO "Gross Margin %";
ALTER TABLE deals RENAME COLUMN gross_margin TO "Gross Margin Value";
ALTER TABLE deals RENAME COLUMN probability TO "Probability (%)";
ALTER TABLE deals RENAME COLUMN forecast TO "Forecast Level";
ALTER TABLE deals RENAME COLUMN forecast_year TO "Forecast Year";
ALTER TABLE deals RENAME COLUMN forecast_close_date TO "Close Date";

-- Recreate index with new column name
DROP INDEX IF EXISTS idx_deals_forecast_year;
CREATE INDEX idx_deals_forecast_year ON deals("Forecast Year");