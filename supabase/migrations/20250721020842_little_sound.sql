/*
  # Add table_notes column to settings table

  1. Changes
    - Add `table_notes` column to `settings` table
    - Column type: `jsonb` to store table notes mappings
    - Default value: empty JSON object

  2. Purpose
    - Allows storing custom notes for wedding tables
    - Supports the table notes feature in the admin dashboard
    - Maintains backward compatibility with existing data
*/

-- Add table_notes column to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'table_notes'
  ) THEN
    ALTER TABLE settings ADD COLUMN table_notes jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update existing records to have empty table_notes object if null
UPDATE settings SET table_notes = '{}'::jsonb WHERE table_notes IS NULL;