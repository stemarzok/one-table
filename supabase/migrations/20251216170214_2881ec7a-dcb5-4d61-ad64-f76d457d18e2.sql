-- Create points_history table to track all points changes
CREATE TABLE public.points_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL,
  reason TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  restaurant_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own points history
CREATE POLICY "Users can view their own points history" 
ON public.points_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- System can insert points history (used by triggers)
CREATE POLICY "System can insert points history" 
ON public.points_history 
FOR INSERT 
WITH CHECK (true);

-- Create trigger to log points changes when bookings are completed
CREATE OR REPLACE FUNCTION public.log_booking_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  points_awarded INTEGER;
  restaurant_price_range TEXT;
  restaurant_name_var TEXT;
BEGIN
  -- Only log points when booking is completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get restaurant info
    SELECT price_range, name INTO restaurant_price_range, restaurant_name_var
    FROM public.restaurants
    WHERE id = NEW.restaurant_id;
    
    -- Calculate points based on price range and guest count
    CASE restaurant_price_range
      WHEN '€' THEN points_awarded := 5 * NEW.guests_count;
      WHEN '€€' THEN points_awarded := 10 * NEW.guests_count;
      WHEN '€€€' THEN points_awarded := 15 * NEW.guests_count;
      WHEN '€€€€' THEN points_awarded := 20 * NEW.guests_count;
      ELSE points_awarded := 5 * NEW.guests_count;
    END CASE;
    
    -- Log to points history
    INSERT INTO public.points_history (user_id, points_change, reason, booking_id, restaurant_name)
    VALUES (NEW.user_id, points_awarded, 'Prenotazione completata', NEW.id, restaurant_name_var);
  END IF;
  
  -- Log points deduction when booking is cancelled
  IF NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed') THEN
    -- Check if within 48 hours of booking
    IF (NEW.booking_date::date + NEW.booking_time::time - interval '48 hours') < now() THEN
      SELECT name INTO restaurant_name_var FROM public.restaurants WHERE id = NEW.restaurant_id;
      
      -- Log deduction (use negative value to indicate loss)
      INSERT INTO public.points_history (user_id, points_change, reason, booking_id, restaurant_name)
      VALUES (NEW.user_id, -10, 'Cancellazione tardiva', NEW.id, restaurant_name_var);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER log_booking_points_trigger
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.log_booking_points();