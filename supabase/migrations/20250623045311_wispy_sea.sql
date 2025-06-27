/*
  # Add missing fields for complete functionality

  1. Changes
    - Add guest_category column to food_menu and drink_menu tables
    - Add currency column to asoebi_items and registry_items tables
    - Add theme and seats_per_table columns to settings table
    - Add background_images column to settings table for uploadable backgrounds
    - Add welcome_images column to settings table for slideshow

  2. Security
    - No changes to existing RLS policies
*/

-- Add guest_category column to food_menu table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'food_menu' AND column_name = 'guest_category'
  ) THEN
    ALTER TABLE food_menu ADD COLUMN guest_category TEXT DEFAULT 'VVIP' CHECK (guest_category IN ('VVIP', 'premium', 'family'));
  END IF;
END $$;

-- Add guest_category column to drink_menu table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drink_menu' AND column_name = 'guest_category'
  ) THEN
    ALTER TABLE drink_menu ADD COLUMN guest_category TEXT DEFAULT 'VVIP' CHECK (guest_category IN ('VVIP', 'premium', 'family'));
  END IF;
END $$;

-- Add currency column to asoebi_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asoebi_items' AND column_name = 'currency'
  ) THEN
    ALTER TABLE asoebi_items ADD COLUMN currency TEXT DEFAULT 'NGN' CHECK (currency IN ('NGN', 'USD', 'GBP', 'EUR'));
  END IF;
END $$;

-- Add currency column to registry_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registry_items' AND column_name = 'currency'
  ) THEN
    ALTER TABLE registry_items ADD COLUMN currency TEXT DEFAULT 'NGN' CHECK (currency IN ('NGN', 'USD', 'GBP', 'EUR'));
  END IF;
END $$;

-- Add theme column to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'theme'
  ) THEN
    ALTER TABLE settings ADD COLUMN theme TEXT DEFAULT 'classic-rose';
  END IF;
END $$;

-- Add seats_per_table column to settings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'seats_per_table'
  ) THEN
    ALTER TABLE settings ADD COLUMN seats_per_table INTEGER DEFAULT 10;
  END IF;
END $$;

-- Add background_images column to settings table (JSON array of image URLs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'background_images'
  ) THEN
    ALTER TABLE settings ADD COLUMN background_images JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add welcome_images column to settings table (JSON array of image URLs for slideshow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'welcome_images'
  ) THEN
    ALTER TABLE settings ADD COLUMN welcome_images JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update existing menu items to have 'VVIP' guest_category if null
UPDATE food_menu SET guest_category = 'VVIP' WHERE guest_category IS NULL;
UPDATE drink_menu SET guest_category = 'VVIP' WHERE guest_category IS NULL;

-- Update existing items to have 'NGN' currency if null
UPDATE asoebi_items SET currency = 'NGN' WHERE currency IS NULL;
UPDATE registry_items SET currency = 'NGN' WHERE currency IS NULL;