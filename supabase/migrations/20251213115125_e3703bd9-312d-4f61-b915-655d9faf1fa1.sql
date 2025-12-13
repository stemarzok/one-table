-- 1. Fix restaurant PII exposure: Create a view for public access with only safe fields
CREATE OR REPLACE VIEW public.restaurants_public AS
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

-- 2. Fix storage policies: Remove overly permissive policies
DROP POLICY IF EXISTS "Restaurant owners can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can update images" ON storage.objects;

-- 3. Ensure proper storage policies exist (folder-scoped)
CREATE POLICY "Restaurant owners can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Restaurant owners can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);