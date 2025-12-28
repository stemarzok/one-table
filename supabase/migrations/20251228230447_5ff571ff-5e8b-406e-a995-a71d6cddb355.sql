-- Create a public view for profiles that hides PII (email, phone)
-- This view only exposes safe fields for public access

CREATE OR REPLACE VIEW public.profiles_public AS
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
COMMENT ON VIEW public.profiles_public IS 'Public view of profiles that hides sensitive PII (email, phone)';