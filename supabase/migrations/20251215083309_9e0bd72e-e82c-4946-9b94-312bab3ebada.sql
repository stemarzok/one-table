-- Drop the restrictive policy
DROP POLICY IF EXISTS "Restaurant staff can update their restaurant bookings" ON public.bookings;

-- Create new policy that allows restaurant staff to update any booking for their restaurant
CREATE POLICY "Restaurant staff can update their restaurant bookings" 
ON public.bookings 
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM business_roles
    WHERE business_roles.user_id = auth.uid() 
    AND business_roles.restaurant_id = bookings.restaurant_id
  )
);