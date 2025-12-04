-- Add expiration date column to promo_codes
ALTER TABLE public.promo_codes 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Add duration_days column to track the original duration setting
ALTER TABLE public.promo_codes 
ADD COLUMN IF NOT EXISTS duration_days integer;