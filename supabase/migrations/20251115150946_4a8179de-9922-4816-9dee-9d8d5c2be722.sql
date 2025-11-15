-- Create enum for business roles
CREATE TYPE public.business_role AS ENUM ('owner', 'manager', 'staff');

-- Create enum for business application status
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Add business fields to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS legal_representative TEXT,
ADD COLUMN IF NOT EXISTS verification_status application_status DEFAULT 'pending';

-- Create business_applications table for registration requests
CREATE TABLE IF NOT EXISTS public.business_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_registration_number TEXT NOT NULL,
  legal_representative TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT NOT NULL,
  business_address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  documents_url TEXT[],
  status application_status DEFAULT 'pending' NOT NULL,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(business_registration_number)
);

-- Create business_roles table to manage user roles for restaurants
CREATE TABLE IF NOT EXISTS public.business_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  role business_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, restaurant_id)
);

-- Enable RLS
ALTER TABLE public.business_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check business role
CREATE OR REPLACE FUNCTION public.has_business_role(_user_id UUID, _restaurant_id UUID, _role business_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_roles
    WHERE user_id = _user_id
      AND restaurant_id = _restaurant_id
      AND role = _role
  )
$$;

-- Function to check if user has any role for a restaurant
CREATE OR REPLACE FUNCTION public.has_any_business_role(_user_id UUID, _restaurant_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_roles
    WHERE user_id = _user_id
      AND restaurant_id = _restaurant_id
  )
$$;

-- RLS Policies for business_applications
CREATE POLICY "Users can view their own applications"
ON public.business_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.business_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending applications"
ON public.business_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for business_roles
CREATE POLICY "Users can view roles for their restaurants"
ON public.business_roles FOR SELECT
USING (
  auth.uid() = user_id OR
  public.has_business_role(auth.uid(), restaurant_id, 'owner') OR
  public.has_business_role(auth.uid(), restaurant_id, 'manager')
);

CREATE POLICY "Restaurant owners can manage roles"
ON public.business_roles FOR ALL
USING (public.has_business_role(auth.uid(), restaurant_id, 'owner'));

-- Update restaurants RLS policies
DROP POLICY IF EXISTS "Owners can manage their restaurants" ON public.restaurants;

CREATE POLICY "Business users can manage their restaurants"
ON public.restaurants FOR ALL
USING (public.has_any_business_role(auth.uid(), id));

-- Triggers for updated_at
CREATE TRIGGER update_business_applications_updated_at
BEFORE UPDATE ON public.business_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_roles_updated_at
BEFORE UPDATE ON public.business_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for business documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('business-documents', 'business-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business documents
CREATE POLICY "Users can upload their business documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their business documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'business-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);