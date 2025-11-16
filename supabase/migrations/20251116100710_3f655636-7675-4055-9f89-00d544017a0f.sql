-- Update RLS policy to allow new row with status 'cancelled'
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('pending','confirmed'))
WITH CHECK (auth.uid() = user_id AND status IN ('cancelled','pending','confirmed'));