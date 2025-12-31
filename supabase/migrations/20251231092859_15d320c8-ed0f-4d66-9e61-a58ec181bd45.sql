-- Create enum for admin roles
CREATE TYPE public.admin_role_type AS ENUM ('admin', 'superadmin');

-- Add role column to admin_roles table
ALTER TABLE public.admin_roles 
ADD COLUMN role public.admin_role_type NOT NULL DEFAULT 'admin';

-- Update stefamarzok@hotmail.it to be superadmin
UPDATE public.admin_roles 
SET role = 'superadmin' 
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'stefamarzok@hotmail.it'
);

-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id AND role = 'superadmin'
  )
$$;

-- Create function to get admin role type
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.admin_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Update RLS policies: only superadmin can manage admin_roles
DROP POLICY IF EXISTS "Only admins can manage admin roles" ON public.admin_roles;

CREATE POLICY "Superadmins can manage admin roles" 
ON public.admin_roles 
FOR ALL 
USING (is_superadmin(auth.uid()));

-- Superadmins can insert new admins (but not superadmins)
CREATE POLICY "Superadmins can insert admins" 
ON public.admin_roles 
FOR INSERT 
WITH CHECK (
  is_superadmin(auth.uid()) 
  AND role = 'admin'
);

-- Superadmins can delete regular admins only (not other superadmins)
CREATE POLICY "Superadmins can delete admins" 
ON public.admin_roles 
FOR DELETE 
USING (
  is_superadmin(auth.uid()) 
  AND role = 'admin'
);