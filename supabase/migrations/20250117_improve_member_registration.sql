-- Migration: Improve member registration fields
-- Description: Add separate phone fields and birthday fields
-- Date: 2024-11-04

-- ============================================
-- 1. Add phone fields (separated by country code and number)
-- ============================================

-- Add country code column (default +1 for US/Miami)
ALTER TABLE members
ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(5) DEFAULT '+1';

-- Add phone number column (10 digits)
ALTER TABLE members
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);

-- Migrate existing phone data to new structure
-- Assumes existing phone is in format like "+1234567890" or "1234567890"
UPDATE members 
SET 
  phone_country_code = CASE 
    WHEN phone LIKE '+%' THEN SUBSTRING(phone FROM 1 FOR POSITION(' ' IN phone || ' ') - 1)
    ELSE '+1'
  END,
  phone_number = CASE 
    WHEN phone LIKE '+%' THEN REGEXP_REPLACE(SUBSTRING(phone FROM POSITION(' ' IN phone || ' ')), '[^0-9]', '', 'g')
    ELSE REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
  END
WHERE phone IS NOT NULL AND phone != '';

-- ============================================
-- 2. Add birthday fields (day, month, year)
-- ============================================

-- Add birthday component fields
ALTER TABLE members
ADD COLUMN IF NOT EXISTS birth_day INTEGER CHECK (birth_day BETWEEN 1 AND 31);

ALTER TABLE members
ADD COLUMN IF NOT EXISTS birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12);

ALTER TABLE members
ADD COLUMN IF NOT EXISTS birth_year INTEGER CHECK (
  birth_year >= 1900 AND 
  birth_year <= EXTRACT(YEAR FROM CURRENT_DATE)
);

-- Add generated column for complete date of birth
ALTER TABLE members
ADD COLUMN IF NOT EXISTS date_of_birth DATE GENERATED ALWAYS AS (
  CASE 
    WHEN birth_day IS NOT NULL AND birth_month IS NOT NULL AND birth_year IS NOT NULL
    THEN make_date(birth_year, birth_month, birth_day)
    ELSE NULL
  END
) STORED;

-- ============================================
-- 3. Create indexes for better performance
-- ============================================

-- Index for phone lookup
CREATE INDEX IF NOT EXISTS idx_members_phone_lookup 
ON members(phone_country_code, phone_number);

-- Index for birthday month/day (for birthday campaigns)
CREATE INDEX IF NOT EXISTS idx_members_birthday_month_day 
ON members(birth_month, birth_day);

-- Index for complete date of birth
CREATE INDEX IF NOT EXISTS idx_members_date_of_birth 
ON members(date_of_birth);

-- ============================================
-- 4. Add comments for documentation
-- ============================================

COMMENT ON COLUMN members.phone_country_code IS 'Country code for phone number (e.g., +1, +52, +54)';
COMMENT ON COLUMN members.phone_number IS 'Phone number without country code (up to 15 digits)';
COMMENT ON COLUMN members.birth_day IS 'Day of birth (1-31)';
COMMENT ON COLUMN members.birth_month IS 'Month of birth (1-12)';
COMMENT ON COLUMN members.birth_year IS 'Year of birth (1900-current year)';
COMMENT ON COLUMN members.date_of_birth IS 'Complete date of birth (auto-generated from day/month/year)';

-- ============================================
-- 5. Create function to get upcoming birthdays
-- ============================================

CREATE OR REPLACE FUNCTION get_upcoming_birthdays(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  member_id UUID,
  full_name TEXT,
  email TEXT,
  phone_country_code VARCHAR(5),
  phone_number VARCHAR(15),
  birth_month INTEGER,
  birth_day INTEGER,
  days_until_birthday INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.full_name,
    m.email,
    m.phone_country_code,
    m.phone_number,
    m.birth_month,
    m.birth_day,
    CASE
      WHEN make_date(
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        m.birth_month,
        m.birth_day
      ) >= CURRENT_DATE
      THEN make_date(
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        m.birth_month,
        m.birth_day
      ) - CURRENT_DATE
      ELSE make_date(
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1,
        m.birth_month,
        m.birth_day
      ) - CURRENT_DATE
    END AS days_until_birthday
  FROM members m
  WHERE 
    m.birth_month IS NOT NULL AND 
    m.birth_day IS NOT NULL AND
    m.status = 'active'
  HAVING days_until_birthday <= days_ahead
  ORDER BY days_until_birthday ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Create function to validate phone number
-- ============================================

CREATE OR REPLACE FUNCTION validate_phone_number(
  country_code VARCHAR(5),
  phone_num VARCHAR(15)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove all non-digit characters
  phone_num := REGEXP_REPLACE(phone_num, '[^0-9]', '', 'g');
  
  -- Basic validation
  IF phone_num IS NULL OR LENGTH(phone_num) < 10 THEN
    RETURN FALSE;
  END IF;
  
  -- Country-specific validation
  CASE country_code
    WHEN '+1' THEN -- US/Canada (10 digits)
      RETURN LENGTH(phone_num) = 10;
    WHEN '+52' THEN -- Mexico (10 digits)
      RETURN LENGTH(phone_num) = 10;
    WHEN '+54' THEN -- Argentina (10-13 digits)
      RETURN LENGTH(phone_num) BETWEEN 10 AND 13;
    ELSE
      RETURN LENGTH(phone_num) BETWEEN 10 AND 15;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. Migration complete notification
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20241104_improve_member_registration completed successfully';
  RAISE NOTICE 'Added columns: phone_country_code, phone_number, birth_day, birth_month, birth_year, date_of_birth';
  RAISE NOTICE 'Created indexes for phone lookup and birthday searches';
  RAISE NOTICE 'Created helper functions: get_upcoming_birthdays, validate_phone_number';
END $$;
