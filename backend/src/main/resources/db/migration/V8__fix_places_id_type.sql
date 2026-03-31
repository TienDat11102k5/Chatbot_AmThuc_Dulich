-- =============================================================================
-- V8__fix_places_id_type.sql
-- Purpose: Fix type mismatch between Place.java (String id) and DB (SERIAL/INTEGER id).
-- Root Cause: V1 created places.id as SERIAL (INTEGER), but Entity uses String.
-- Solution: Convert places.id from INTEGER → VARCHAR(50) to match Entity mapping.
-- =============================================================================

-- Step 1: Drop FK constraints referencing places.id
ALTER TABLE user_favorites DROP CONSTRAINT IF EXISTS user_favorites_place_id_fkey;

-- Step 2: Drop default (auto-increment sequence) on places.id
ALTER TABLE places ALTER COLUMN id DROP DEFAULT;

-- Step 3: Convert places.id from INTEGER → VARCHAR(50)
-- USING clause safely converts existing data: 1 → '1', 2 → '2', etc.
ALTER TABLE places ALTER COLUMN id TYPE VARCHAR(50) USING id::VARCHAR(50);

-- Step 4: Convert user_favorites.place_id to match
ALTER TABLE user_favorites ALTER COLUMN place_id TYPE VARCHAR(50) USING place_id::VARCHAR(50);

-- Step 5: Re-add FK constraint
ALTER TABLE user_favorites ADD CONSTRAINT user_favorites_place_id_fkey
    FOREIGN KEY (place_id) REFERENCES places(id);

-- Step 6: Relax category_id NOT NULL (Entity Place.java has no @ManyToOne Category)
-- Category is stored directly in category_vi column instead
ALTER TABLE places ALTER COLUMN category_id DROP NOT NULL;

-- Step 7: Add missing columns that Place.java Entity declares but V1 migration didn't create
ALTER TABLE places ADD COLUMN IF NOT EXISTS domain VARCHAR(255);
ALTER TABLE places ADD COLUMN IF NOT EXISTS district VARCHAR(255);
ALTER TABLE places ADD COLUMN IF NOT EXISTS province VARCHAR(255);
ALTER TABLE places ADD COLUMN IF NOT EXISTS search_text TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS data_source VARCHAR(255);
ALTER TABLE places ADD COLUMN IF NOT EXISTS category_vi VARCHAR(255);
ALTER TABLE places ADD COLUMN IF NOT EXISTS address VARCHAR(500);
ALTER TABLE places ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE places ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

-- Step 8: Drop orphan sequence created by SERIAL (no longer needed for VARCHAR id)
DROP SEQUENCE IF EXISTS places_id_seq;
