-- Add new columns for restaurant categories
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS cuisine_types text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specializations text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS occasions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS extra_features text[] DEFAULT '{}';