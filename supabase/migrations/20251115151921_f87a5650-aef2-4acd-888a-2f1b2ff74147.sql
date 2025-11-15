-- Fix search_path for get_restaurant_rating function
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
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path for check_booking_availability function
CREATE OR REPLACE FUNCTION public.check_booking_availability(
  _restaurant_id UUID,
  _booking_date DATE,
  _booking_time TIME,
  _guests_count INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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