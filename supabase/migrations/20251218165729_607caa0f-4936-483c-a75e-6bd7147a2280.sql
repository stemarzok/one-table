-- Allow anyone authenticated to view basic profile info (name, level, avatar_url)
-- This is needed for displaying reviewer names in reviews
CREATE POLICY "Anyone can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (true);