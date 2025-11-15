-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  special_requests TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT valid_booking_time CHECK (
    booking_date >= CURRENT_DATE
  )
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
  service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
  ambiance_rating INTEGER CHECK (ambiance_rating >= 1 AND ambiance_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, booking_id)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

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

-- Add triggers
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate restaurant average rating
CREATE OR REPLACE FUNCTION public.get_restaurant_rating(restaurant_id_param UUID)
RETURNS TABLE(
  avg_rating NUMERIC,
  total_reviews BIGINT,
  avg_food NUMERIC,
  avg_service NUMERIC,
  avg_ambiance NUMERIC
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    ROUND(AVG(rating)::numeric, 1) as avg_rating,
    COUNT(*)::bigint as total_reviews,
    ROUND(AVG(food_rating)::numeric, 1) as avg_food,
    ROUND(AVG(service_rating)::numeric, 1) as avg_service,
    ROUND(AVG(ambiance_rating)::numeric, 1) as avg_ambiance
  FROM public.reviews
  WHERE restaurant_id = restaurant_id_param
$$;

-- Function to check booking availability
CREATE OR REPLACE FUNCTION public.check_booking_availability(
  _restaurant_id UUID,
  _booking_date DATE,
  _booking_time TIME,
  _guests_count INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  available_tables INTEGER;
BEGIN
  -- Check if there are enough available tables
  SELECT COUNT(*) INTO available_tables
  FROM public.restaurant_tables
  WHERE restaurant_id = _restaurant_id
    AND is_available = true
    AND seats >= _guests_count
    AND id NOT IN (
      SELECT table_id
      FROM public.bookings
      WHERE restaurant_id = _restaurant_id
        AND booking_date = _booking_date
        AND booking_time = _booking_time
        AND status IN ('pending', 'confirmed')
        AND table_id IS NOT NULL
    );
  
  RETURN available_tables > 0;
END;
$$;

-- Enable realtime
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.reviews REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;