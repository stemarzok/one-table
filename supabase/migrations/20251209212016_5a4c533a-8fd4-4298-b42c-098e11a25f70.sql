-- Add onboarding_completed field to track if user has seen the tutorial
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;