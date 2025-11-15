-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
ON public.favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
ON public.favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Function to update user level based on points
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.points >= 601 THEN
    NEW.level := 'Platinum';
  ELSIF NEW.points >= 301 THEN
    NEW.level := 'Gold';
  ELSIF NEW.points >= 101 THEN
    NEW.level := 'Silver';
  ELSE
    NEW.level := 'Bronze';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically update level when points change
CREATE TRIGGER update_level_on_points_change
BEFORE UPDATE OF points ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_user_level();

-- Function to award points on booking completion
CREATE OR REPLACE FUNCTION public.award_booking_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
  restaurant_price_range TEXT;
BEGIN
  -- Only award points when booking is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get restaurant price range
    SELECT price_range INTO restaurant_price_range
    FROM public.restaurants
    WHERE id = NEW.restaurant_id;
    
    -- Calculate points based on price range and guest count
    -- Base points: € = 5, €€ = 10, €€€ = 15, €€€€ = 20
    -- Multiplied by number of guests
    CASE restaurant_price_range
      WHEN '€' THEN points_to_award := 5 * NEW.guests_count;
      WHEN '€€' THEN points_to_award := 10 * NEW.guests_count;
      WHEN '€€€' THEN points_to_award := 15 * NEW.guests_count;
      WHEN '€€€€' THEN points_to_award := 20 * NEW.guests_count;
      ELSE points_to_award := 5 * NEW.guests_count;
    END CASE;
    
    -- Award points to user
    UPDATE public.profiles
    SET points = points + points_to_award
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to award points when booking is completed
CREATE TRIGGER award_points_on_completion
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.award_booking_points();

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;