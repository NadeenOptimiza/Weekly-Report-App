/*
  # Add RPC Function for Bulk Delete Operations

  1. New Functions
    - `delete_all_deals()` - Deletes all records from the deals table
      - Only callable by Nadeen Habboub (nadeen.habboub@optimizo.me)
      - Returns the count of deleted records

  2. Security
    - Function checks user email before executing
    - Raises exception if unauthorized user attempts to call
    - Uses SECURITY DEFINER to execute with elevated privileges

  3. Notes
    - This function bypasses PostgREST client filtering issues
    - More reliable than client-side delete operations with filters
    - Used during "Replace All Data" upload mode
*/

-- Create function to delete all deals (only for authorized users)
CREATE OR REPLACE FUNCTION delete_all_deals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
  user_email text;
BEGIN
  -- Get the current user's email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Check if user is authorized
  IF user_email != 'nadeen.habboub@optimizo.me' THEN
    RAISE EXCEPTION 'Unauthorized: Only nadeen.habboub@optimizo.me can delete all deals';
  END IF;

  -- Delete all records and get count
  DELETE FROM deals;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_all_deals() TO authenticated;