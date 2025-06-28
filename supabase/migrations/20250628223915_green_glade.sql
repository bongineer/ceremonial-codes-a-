/*
  # Add reception details to settings

  1. Changes
    - Add reception_venue column to settings table
    - Add reception_date column to settings table

  2. Security
    - No changes to existing RLS policies
*/

-- Add reception_venue column to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'reception_venue'
  ) THEN
    ALTER TABLE settings ADD COLUMN reception_venue TEXT;
  END IF;
END $$;

-- Add reception_date column to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'reception_date'
  ) THEN
    ALTER TABLE settings ADD COLUMN reception_date TIMESTAMPTZ;
  END IF;
END $$;

-- Set default values for existing records
UPDATE settings 
SET 
  reception_venue = venue || ' - Reception Hall',
  reception_date = event_date + INTERVAL '2 hours'
WHERE reception_venue IS NULL OR reception_date IS NULL;