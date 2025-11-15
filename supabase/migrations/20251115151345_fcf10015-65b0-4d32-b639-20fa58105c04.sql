-- Create admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for admin_roles
CREATE POLICY "Admins can view all admin roles"
ON public.admin_roles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage admin roles"
ON public.admin_roles FOR ALL
USING (public.is_admin(auth.uid()));

-- Update business_applications policies to allow admin access
CREATE POLICY "Admins can view all applications"
ON public.business_applications FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update applications"
ON public.business_applications FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Function to approve business application
CREATE OR REPLACE FUNCTION public.approve_business_application(
  _application_id UUID,
  _admin_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _app RECORD;
  _restaurant_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve applications';
  END IF;

  -- Get application details
  SELECT * INTO _app FROM public.business_applications WHERE id = _application_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF _app.status != 'pending' THEN
    RAISE EXCEPTION 'Application already processed';
  END IF;

  -- Create restaurant
  INSERT INTO public.restaurants (
    owner_id,
    name,
    business_name,
    business_registration_number,
    legal_representative,
    email,
    phone,
    address,
    city,
    is_verified,
    verification_status
  ) VALUES (
    _app.user_id,
    _app.business_name,
    _app.business_name,
    _app.business_registration_number,
    _app.legal_representative,
    _app.business_email,
    _app.business_phone,
    _app.business_address,
    _app.city,
    true,
    'approved'
  ) RETURNING id INTO _restaurant_id;

  -- Assign owner role to user
  INSERT INTO public.business_roles (user_id, restaurant_id, role)
  VALUES (_app.user_id, _restaurant_id, 'owner');

  -- Update application status
  UPDATE public.business_applications
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = _admin_id
  WHERE id = _application_id;

  RETURN _restaurant_id;
END;
$$;

-- Function to reject business application
CREATE OR REPLACE FUNCTION public.reject_business_application(
  _application_id UUID,
  _admin_id UUID,
  _reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _app RECORD;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(_admin_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reject applications';
  END IF;

  -- Get application details
  SELECT * INTO _app FROM public.business_applications WHERE id = _application_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  IF _app.status != 'pending' THEN
    RAISE EXCEPTION 'Application already processed';
  END IF;

  -- Update application status
  UPDATE public.business_applications
  SET 
    status = 'rejected',
    rejection_reason = _reason,
    reviewed_at = now(),
    reviewed_by = _admin_id
  WHERE id = _application_id;
END;
$$;

-- Enable realtime for tables
ALTER TABLE public.restaurant_tables REPLICA IDENTITY FULL;
ALTER TABLE public.menus REPLICA IDENTITY FULL;
ALTER TABLE public.business_applications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_applications;