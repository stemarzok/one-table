-- Fix: Replace SECURITY DEFINER view with SECURITY INVOKER view
-- This ensures the view uses the permissions of the querying user
DROP VIEW IF EXISTS public.restaurants_public;

CREATE VIEW public.restaurants_public
WITH (security_invoker = true)
AS
SELECT 
  id, 
  name, 
  description, 
  address, 
  city, 
  cuisine_type, 
  price_range, 
  cover_image_url, 
  logo_url, 
  opening_hours, 
  is_active,
  created_at,
  updated_at
FROM public.restaurants
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.restaurants_public TO anon, authenticated;