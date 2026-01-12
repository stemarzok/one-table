-- Trigger per notificare gli admin quando arriva una richiesta di sponsorizzazione
CREATE OR REPLACE FUNCTION public.notify_admins_sponsorship_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  restaurant_name_var TEXT;
BEGIN
  -- Get restaurant name
  SELECT name INTO restaurant_name_var
  FROM public.restaurants
  WHERE id = NEW.restaurant_id;
  
  -- Notify all admins
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT 
    ar.user_id,
    'sponsorship_request',
    'Nuova richiesta sponsorizzazione',
    'Nuova richiesta di sponsorizzazione per ' || COALESCE(restaurant_name_var, 'un ristorante') || ' da ' || NEW.email,
    '/admin?tab=sponsorships'
  FROM public.admin_roles ar;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_sponsorship_request_created
AFTER INSERT ON public.sponsorship_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_sponsorship_request();

-- Trigger per notificare il business user quando viene generato un codice sponsorizzazione
CREATE OR REPLACE FUNCTION public.notify_user_sponsorship_code_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  restaurant_name_var TEXT;
BEGIN
  -- Get restaurant name
  SELECT name INTO restaurant_name_var
  FROM public.restaurants
  WHERE id = NEW.restaurant_id;
  
  -- Notify the business user
  INSERT INTO public.notifications (user_id, restaurant_id, type, title, message, link)
  VALUES (
    NEW.user_id,
    NEW.restaurant_id,
    'sponsorship_code_generated',
    'Codice sponsorizzazione disponibile! 🎉',
    'È stato generato un codice sponsorizzazione per ' || COALESCE(restaurant_name_var, 'il tuo ristorante') || '. Codice: ' || NEW.code || ' (' || COALESCE(NEW.duration_days::text, '30') || ' giorni)',
    '/promo'
  );
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_sponsorship_code_created
AFTER INSERT ON public.sponsorship_codes
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_sponsorship_code_created();

-- Trigger per notificare gli admin quando arriva una richiesta promo abbonamento
CREATE OR REPLACE FUNCTION public.notify_admins_promo_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Notify all admins
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT 
    ar.user_id,
    'promo_request',
    'Nuova richiesta codice promo',
    'Nuova richiesta di codice promo da ' || NEW.email,
    '/admin?tab=promo'
  FROM public.admin_roles ar;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_promo_request_created
AFTER INSERT ON public.promo_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_admins_promo_request();

-- Trigger per notificare l'utente quando viene generato un codice promo
CREATE OR REPLACE FUNCTION public.notify_user_promo_code_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Notify the user
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.user_id,
    'promo_code_generated',
    'Codice promo disponibile! 🎉',
    'È stato generato un codice promo per te. Codice: ' || NEW.code || CASE WHEN NEW.duration_days IS NOT NULL THEN ' (' || NEW.duration_days::text || ' giorni)' ELSE ' (illimitato)' END,
    '/billing'
  );
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_promo_code_created
AFTER INSERT ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.notify_user_promo_code_created();

-- Aggiorna constraint notifications per includere nuovi tipi
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS valid_notification_type;
ALTER TABLE public.notifications ADD CONSTRAINT valid_notification_type CHECK (type IN (
  'new_review',
  'booking_status',
  'booking_confirmed',
  'booking_cancelled',
  'booking_completed',
  'new_booking',
  'booking_cancelled_by_user',
  'application_approved',
  'application_rejected',
  'review_response',
  'points_change',
  'sponsorship_request',
  'sponsorship_code_generated',
  'promo_request',
  'promo_code_generated'
));