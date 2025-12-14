-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can create reviews for their completed bookings" ON public.reviews;

-- Create new policy that allows users to review any restaurant they've visited
CREATE POLICY "Users can create reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also create a bucket for review photos if not exists (using restaurant-images is fine)
-- Create a folder-based policy for review photos
CREATE POLICY "Users can upload review photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);