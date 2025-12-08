-- Drop existing policies and recreate with better logic
DROP POLICY IF EXISTS "Restaurant owners can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can update images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurant owners can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view restaurant images" ON storage.objects;

-- Create storage policies for restaurant-images bucket with simpler logic
CREATE POLICY "Restaurant owners can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Restaurant owners can update images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'restaurant-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Restaurant owners can delete images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'restaurant-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view restaurant images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'restaurant-images');

-- Add marketing consent column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;