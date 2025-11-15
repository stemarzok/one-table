-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their pending bookings" ON public.bookings;
DROP POLICY IF EXISTS "Restaurant staff can view their restaurant bookings" ON public.bookings;
DROP POLICY IF EXISTS "Restaurant staff can update their restaurant bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for their completed bookings" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Bookings RLS Policies
CREATE POLICY "Users can view their own bookings"
ON public.bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
ON public.bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Restaurant staff can view their restaurant bookings"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_roles
    WHERE user_id = auth.uid() AND restaurant_id = bookings.restaurant_id
  )
);

CREATE POLICY "Restaurant staff can update their restaurant bookings"
ON public.bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.business_roles
    WHERE user_id = auth.uid() AND restaurant_id = bookings.restaurant_id
  )
);

-- Reviews RLS Policies
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for their completed bookings"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = reviews.booking_id 
    AND user_id = auth.uid()
    AND status = 'completed'
  )
);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);