-- Fix RLS policy to allow users to cancel their confirmed bookings
DROP POLICY IF EXISTS "Users can update their pending bookings" ON public.bookings;

-- Allow users to update their own bookings if they are pending or confirmed
-- They can cancel confirmed bookings or modify pending ones
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND status IN ('pending', 'confirmed')
);