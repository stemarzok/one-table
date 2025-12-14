-- Trigger to notify user when business application status changes
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        NEW.user_id,
        'application_approved',
        'Richiesta Approvata! 🎉',
        'La tua richiesta di registrazione business è stata approvata. Puoi ora accedere alla tua dashboard.',
        '/dashboard'
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        NEW.user_id,
        'application_rejected',
        'Richiesta Non Approvata',
        COALESCE('La tua richiesta è stata rifiutata. Motivo: ' || NEW.rejection_reason, 'La tua richiesta è stata rifiutata.'),
        '/business-registration'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on business_applications
DROP TRIGGER IF EXISTS on_application_status_change ON public.business_applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE ON public.business_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_status_change();

-- Also enable realtime for notifications so users get instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;