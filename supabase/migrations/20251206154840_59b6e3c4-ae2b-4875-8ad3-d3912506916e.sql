-- Drop and recreate the check constraints to allow promo subscriptions

-- Drop existing constraints
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_billing_period_check;

-- Add new constraints with additional values for promo codes
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_plan_type_check 
CHECK (plan_type = ANY (ARRAY['base'::text, 'pro'::text, 'promo_speciale'::text]));

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_billing_period_check 
CHECK (billing_period = ANY (ARRAY['monthly'::text, 'yearly'::text, 'lifetime'::text]));