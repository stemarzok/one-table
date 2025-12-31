-- Create admin activity log table
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  target_email TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only superadmins and admins can view logs
CREATE POLICY "Admins can view activity logs" 
ON public.admin_activity_logs 
FOR SELECT 
USING (is_admin(auth.uid()));

-- System can insert logs
CREATE POLICY "System can insert activity logs" 
ON public.admin_activity_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_email TEXT;
  target_email TEXT;
  action_type TEXT;
BEGIN
  -- Get actor email (the person performing the action)
  SELECT email INTO actor_email FROM public.profiles WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    -- Get target user email
    SELECT email INTO target_email FROM public.profiles WHERE id = NEW.user_id;
    
    action_type := CASE 
      WHEN NEW.role = 'superadmin' THEN 'superadmin_created'
      ELSE 'admin_promoted'
    END;
    
    INSERT INTO public.admin_activity_logs (actor_id, action, target_user_id, target_email, details)
    VALUES (
      COALESCE(auth.uid(), NEW.created_by),
      action_type,
      NEW.user_id,
      target_email,
      jsonb_build_object('role', NEW.role::text)
    );
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Get target user email
    SELECT email INTO target_email FROM public.profiles WHERE id = OLD.user_id;
    
    INSERT INTO public.admin_activity_logs (actor_id, action, target_user_id, target_email, details)
    VALUES (
      auth.uid(),
      'admin_removed',
      OLD.user_id,
      target_email,
      jsonb_build_object('role', OLD.role::text)
    );
    
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Get target user email
    SELECT email INTO target_email FROM public.profiles WHERE id = NEW.user_id;
    
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      INSERT INTO public.admin_activity_logs (actor_id, action, target_user_id, target_email, details)
      VALUES (
        auth.uid(),
        'admin_role_changed',
        NEW.user_id,
        target_email,
        jsonb_build_object('old_role', OLD.role::text, 'new_role', NEW.role::text)
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for admin role changes
CREATE TRIGGER on_admin_role_change
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_activity();