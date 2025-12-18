-- 1. Notify restaurant when a new booking is created
CREATE OR REPLACE FUNCTION public.notify_restaurant_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Notify all restaurant staff about new booking
  INSERT INTO public.notifications (user_id, restaurant_id, type, title, message, link)
  SELECT 
    br.user_id,
    NEW.restaurant_id,
    'new_booking',
    'Nuova prenotazione',
    'Hai ricevuto una nuova richiesta di prenotazione per ' || NEW.guests_count || ' persone il ' || to_char(NEW.booking_date, 'DD/MM/YYYY') || ' alle ' || to_char(NEW.booking_time, 'HH24:MI'),
    '/dashboard?tab=bookings'
  FROM public.business_roles br
  WHERE br.restaurant_id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_booking
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_restaurant_new_booking();

-- 2. Notify user when booking status changes (confirmed, cancelled, completed)
CREATE OR REPLACE FUNCTION public.notify_user_booking_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  restaurant_name_var TEXT;
  notification_title TEXT;
  notification_message TEXT;
  notification_type TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get restaurant name
    SELECT name INTO restaurant_name_var
    FROM public.restaurants
    WHERE id = NEW.restaurant_id;
    
    -- Determine notification based on new status
    IF NEW.status = 'confirmed' THEN
      notification_type := 'booking_confirmed';
      notification_title := 'Prenotazione confermata! ✓';
      notification_message := 'La tua prenotazione presso ' || restaurant_name_var || ' per il ' || to_char(NEW.booking_date, 'DD/MM/YYYY') || ' alle ' || to_char(NEW.booking_time, 'HH24:MI') || ' è stata confermata.';
    ELSIF NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed') THEN
      notification_type := 'booking_cancelled';
      notification_title := 'Prenotazione cancellata';
      notification_message := 'La tua prenotazione presso ' || restaurant_name_var || ' per il ' || to_char(NEW.booking_date, 'DD/MM/YYYY') || ' è stata cancellata.';
    ELSIF NEW.status = 'completed' THEN
      notification_type := 'booking_completed';
      notification_title := 'Prenotazione completata';
      notification_message := 'Grazie per aver visitato ' || restaurant_name_var || '! Lascia una recensione per condividere la tua esperienza.';
    ELSE
      RETURN NEW;
    END IF;
    
    -- Insert notification for the user
    INSERT INTO public.notifications (user_id, restaurant_id, type, title, message, link)
    VALUES (NEW.user_id, NEW.restaurant_id, notification_type, notification_title, notification_message, '/my-bookings');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_booking_status_change();

-- 3. Notify user when restaurant responds to their review
CREATE OR REPLACE FUNCTION public.notify_user_review_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  review_user_id UUID;
  restaurant_name_var TEXT;
BEGIN
  -- Get the original review author
  SELECT r.user_id INTO review_user_id
  FROM public.reviews r
  WHERE r.id = NEW.review_id;
  
  -- Get restaurant name
  SELECT name INTO restaurant_name_var
  FROM public.restaurants
  WHERE id = NEW.restaurant_id;
  
  -- Don't notify if the responder is the review author (edge case)
  IF review_user_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, restaurant_id, type, title, message, link)
    VALUES (
      review_user_id,
      NEW.restaurant_id,
      'review_response',
      'Risposta alla tua recensione',
      restaurant_name_var || ' ha risposto alla tua recensione.',
      '/restaurant/' || NEW.restaurant_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_response
  AFTER INSERT ON public.review_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_review_response();

-- 4. Notify user when they earn/lose points
CREATE OR REPLACE FUNCTION public.notify_user_points_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF NEW.points_change > 0 THEN
    notification_title := 'Punti guadagnati! +' || NEW.points_change;
    notification_message := 'Hai guadagnato ' || NEW.points_change || ' punti' || 
      CASE WHEN NEW.restaurant_name IS NOT NULL THEN ' grazie a ' || NEW.restaurant_name ELSE '' END || '.';
  ELSE
    notification_title := 'Punti persi: ' || NEW.points_change;
    notification_message := 'Hai perso ' || ABS(NEW.points_change) || ' punti. ' || NEW.reason;
  END IF;
  
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (NEW.user_id, 'points_change', notification_title, notification_message, '/profile');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_points_change
  AFTER INSERT ON public.points_history
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_points_change();

-- 5. Notify restaurant when user cancels their booking
CREATE OR REPLACE FUNCTION public.notify_restaurant_booking_cancelled()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger when user cancels their own booking (status changes to cancelled)
  IF NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed') THEN
    INSERT INTO public.notifications (user_id, restaurant_id, type, title, message, link)
    SELECT 
      br.user_id,
      NEW.restaurant_id,
      'booking_cancelled_by_user',
      'Prenotazione cancellata',
      'La prenotazione di ' || NEW.user_name || ' per il ' || to_char(NEW.booking_date, 'DD/MM/YYYY') || ' alle ' || to_char(NEW.booking_time, 'HH24:MI') || ' è stata cancellata.',
      '/dashboard?tab=bookings'
    FROM public.business_roles br
    WHERE br.restaurant_id = NEW.restaurant_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_cancelled_notify_restaurant
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_restaurant_booking_cancelled();