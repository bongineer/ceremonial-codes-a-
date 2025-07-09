/*
  # Add table_names column to settings table

  1. Schema Changes
    - Add `table_names` column to `settings` table
    - Column type: `jsonb` to store table name mappings
    - Default value: empty JSON object

  2. Purpose
    - Allows storing custom names for wedding tables
    - Supports the table management feature in the admin dashboard
    - Maintains backward compatibility with existing data
*/

-- Add table_names column to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'table_names'
  ) THEN
    ALTER TABLE settings ADD COLUMN table_names jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;