-- Add DELETE policy for admins on promo_codes
CREATE POLICY "Admins can delete codes" 
ON public.promo_codes 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Add admin INSERT/UPDATE/SELECT policies on subscriptions for promo activation
CREATE POLICY "Admins can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (is_admin(auth.uid()));

-- Ensure users can UPDATE their own subscription (for promo activation)
CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);