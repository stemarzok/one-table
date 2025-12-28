-- Fix the SECURITY DEFINER issue on the view
-- Drop and recreate with SECURITY INVOKER (default, explicit for clarity)
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  avatar_url,
  level,
  points,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Add comment for documentation
COMMENT ON VIEW public.profiles_public IS 'Public view of profiles that hides sensitive PII (email, phone). Uses SECURITY INVOKER to respect RLS.';