-- Drop existing policy if it exists (it might not work for anonymous users)
DROP POLICY IF EXISTS "Anyone can view active restaurants" ON public.restaurants;

-- Create new policy that allows both anonymous and authenticated users to view active restaurants
CREATE POLICY "Anyone can view active restaurants"
ON public.restaurants
FOR SELECT
TO anon, authenticated
USING (is_active = true);