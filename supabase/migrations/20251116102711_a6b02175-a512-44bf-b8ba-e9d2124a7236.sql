-- Give admins full access to all tables

-- Admins can view and manage all restaurants
DROP POLICY IF EXISTS "Admins can view all restaurants" ON public.restaurants;
CREATE POLICY "Admins can view all restaurants"
ON public.restaurants
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all restaurants" ON public.restaurants;
CREATE POLICY "Admins can manage all restaurants"
ON public.restaurants
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can view and manage all bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can view and manage all tables
DROP POLICY IF EXISTS "Admins can view all tables" ON public.restaurant_tables;
CREATE POLICY "Admins can view all tables"
ON public.restaurant_tables
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all tables" ON public.restaurant_tables;
CREATE POLICY "Admins can manage all tables"
ON public.restaurant_tables
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Admins can view and manage all menus
DROP POLICY IF EXISTS "Admins can view all menus" ON public.menus;
CREATE POLICY "Admins can view all menus"
ON public.menus
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all menus" ON public.menus;
CREATE POLICY "Admins can manage all menus"
ON public.menus
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));