
-- Create promo_requests table for special code requests
CREATE TABLE public.promo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo_codes table for generated codes
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  valid BOOLEAN NOT NULL DEFAULT true,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policies for promo_requests
CREATE POLICY "Users can create their own requests"
ON public.promo_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
ON public.promo_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.promo_requests FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update requests"
ON public.promo_requests FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Policies for promo_codes
CREATE POLICY "Admins can create codes"
ON public.promo_codes FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all codes"
ON public.promo_codes FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own codes"
ON public.promo_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can use their own codes"
ON public.promo_codes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update codes"
ON public.promo_codes FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_promo_requests_updated_at
BEFORE UPDATE ON public.promo_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
