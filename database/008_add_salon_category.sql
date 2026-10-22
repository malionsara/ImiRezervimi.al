-- Add Salon Category Field
-- This migration adds a category field to salons table to support beauty salons and barbershops
-- Priority: HIGH - Enables dual audience support (beauty salons vs barbershops)

-- ==============================================
-- ADD SALON CATEGORY TYPE
-- ==============================================

-- Create salon category enum type
CREATE TYPE salon_category AS ENUM ('beauty', 'barbershop', 'unisex');

-- ==============================================
-- ADD CATEGORY COLUMN TO SALONS TABLE
-- ==============================================

-- Add category column with default 'beauty' for existing salons
ALTER TABLE salons 
ADD COLUMN IF NOT EXISTS category salon_category DEFAULT 'beauty' NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN salons.category IS 'Salon category: beauty (beauty salons), barbershop (barbershops), or unisex (both)';

-- ==============================================
-- CREATE INDEX FOR PERFORMANCE
-- ==============================================

-- Create index for filtering by category
CREATE INDEX IF NOT EXISTS idx_salons_category ON salons(category) WHERE status = 'active';

-- ==============================================
-- UPDATE EXISTING DATA (OPTIONAL)
-- ==============================================

-- If you want to automatically categorize existing salons based on name/keywords
-- Uncomment and modify this section based on your needs:
/*
UPDATE salons 
SET category = 'barbershop' 
WHERE (
    LOWER(name) LIKE '%berber%' OR 
    LOWER(name) LIKE '%barber%' OR
    LOWER(description) LIKE '%berber%' OR
    LOWER(description) LIKE '%barber%'
) AND category = 'beauty';
*/

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'salons' 
        AND column_name = 'category'
    ) THEN
        RAISE NOTICE '✅ Salon category column added successfully';
    ELSE
        RAISE EXCEPTION '❌ Failed to add salon category column';
    END IF;
END $$;

-- Show current distribution
SELECT category, COUNT(*) as count 
FROM salons 
GROUP BY category;

