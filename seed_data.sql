-- SEED DATA SCRIPT
-- Run this in your Supabase SQL Editor to verify your leaderboard works.

-- 1. ENSURE TABLES EXIST
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  hometown TEXT,
  favorite_quote TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.hikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. FIX COLUMNS AND RELATIONSHIPS
-- Ensure hikes has the correct columns
ALTER TABLE public.hikes ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.hikes ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE public.hikes ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.hikes ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.hikes ADD COLUMN IF NOT EXISTS path_points JSONB;

-- Ensure profiles has the correct columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hometown TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_quote TEXT;

-- IMPORTANT: Fix the Foreign Key to point to PROFILES, not auth.users
-- This allows us to join with profiles in our query.
-- We drop the old constraint if it exists to avoid conflicts.
ALTER TABLE public.hikes DROP CONSTRAINT IF EXISTS hikes_user_id_fkey;
-- We also try to drop any constraint referencing auth.users if it was named differently
-- (This is a best-effort cleanup)

-- Add the correct constraint
ALTER TABLE public.hikes 
ADD CONSTRAINT hikes_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id);


-- 3. INSERT FAKE PROFILES
-- We need these profiles to exist so the hikes can reference them.
INSERT INTO public.profiles (id, full_name, hometown, favorite_quote, updated_at) VALUES
('0a820083-333e-43f2-bd87-ab7ea72b9ffc', 'Mountain Goat', 'Denver, CO', 'The mountains are calling and I must go.', now())
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  hometown = EXCLUDED.hometown,
  favorite_quote = EXCLUDED.favorite_quote;

INSERT INTO public.profiles (id, full_name, hometown, favorite_quote, updated_at) VALUES
('5b7752c1-82cf-4bb0-abc6-9b052cb99678', 'Trail Blazer', 'Portland, OR', 'Not all those who wander are lost.', now())
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  hometown = EXCLUDED.hometown,
  favorite_quote = EXCLUDED.favorite_quote;

INSERT INTO public.profiles (id, full_name, hometown, favorite_quote, updated_at) VALUES
('807a8bb6-53ac-4ee8-b17a-147ee7f5e129', 'Cactus Jack', 'Tucson, AZ', 'It is a dry heat.', now())
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  hometown = EXCLUDED.hometown,
  favorite_quote = EXCLUDED.favorite_quote;


-- 4. INSERT HIKES
-- User 1: Mountain Goat
INSERT INTO public.hikes (user_id, duration_seconds, created_at, start_time, end_time) VALUES 
('0a820083-333e-43f2-bd87-ab7ea72b9ffc', 3600, now() - interval '1 day', now() - interval '1 day' - interval '1 hour', now() - interval '1 day'),
('0a820083-333e-43f2-bd87-ab7ea72b9ffc', 3400, now() - interval '3 days', now() - interval '3 days' - interval '3400 seconds', now() - interval '3 days');

-- User 2: Trail Blazer
INSERT INTO public.hikes (user_id, duration_seconds, created_at, start_time, end_time) VALUES 
('5b7752c1-82cf-4bb0-abc6-9b052cb99678', 4200, now() - interval '2 hours', now() - interval '2 hours' - interval '4200 seconds', now() - interval '2 hours'),
('5b7752c1-82cf-4bb0-abc6-9b052cb99678', 4000, now() - interval '5 days', now() - interval '5 days' - interval '4000 seconds', now() - interval '5 days');

-- User 3: Cactus Jack
INSERT INTO public.hikes (user_id, duration_seconds, created_at, start_time, end_time) VALUES 
('807a8bb6-53ac-4ee8-b17a-147ee7f5e129', 2900, now() - interval '1 week', now() - interval '1 week' - interval '2900 seconds', now() - interval '1 week');