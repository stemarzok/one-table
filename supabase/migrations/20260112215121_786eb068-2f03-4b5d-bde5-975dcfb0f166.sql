-- Create sponsorship_requests table for business users to request sponsorship codes
CREATE TABLE public.sponsorship_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  duration_days INTEGER, -- requested duration
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsorship_codes table for admin-generated sponsorship codes
CREATE TABLE public.sponsorship_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- the business user this code is for
  duration_days INTEGER, -- how many days the sponsorship lasts
  valid BOOLEAN NOT NULL DEFAULT true,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- when the code itself expires (different from sponsorship end)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_codes ENABLE ROW LEVEL SECURITY;

-- RLS for sponsorship_requests
CREATE POLICY "Users can view their own sponsorship requests"
ON public.sponsorship_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create sponsorship requests for their restaurants"
ON public.sponsorship_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all sponsorship requests"
ON public.sponsorship_requests FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update sponsorship requests"
ON public.sponsorship_requests FOR UPDATE
USING (is_admin(auth.uid()));

-- RLS for sponsorship_codes
CREATE POLICY "Users can view their own sponsorship codes"
ON public.sponsorship_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sponsorship codes"
ON public.sponsorship_codes FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create sponsorship codes"
ON public.sponsorship_codes FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can update their own sponsorship codes to use them"
ON public.sponsorship_codes FOR UPDATE
USING (auth.uid() = user_id);

-- Updated_at trigger for sponsorship_requests
CREATE TRIGGER update_sponsorship_requests_updated_at
BEFORE UPDATE ON public.sponsorship_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();