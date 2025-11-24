-- Create subscriptions table to manage user subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('base', 'pro')),
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'canceled', 'past_due', 'incomplete')),
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own subscription (during checkout)
CREATE POLICY "Users can create their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- System can update subscriptions (via webhook)
CREATE POLICY "System can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (true);

-- Function to check if user has active subscription or trial
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = _user_id
      AND (
        (status = 'trialing' AND trial_end > now())
        OR status = 'active'
      )
  )
$$;

-- Function to get days remaining in trial
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN trial_end IS NULL THEN 0
      WHEN trial_end < now() THEN 0
      ELSE EXTRACT(DAY FROM (trial_end - now()))::INTEGER
    END
  FROM public.subscriptions
  WHERE user_id = _user_id
    AND status = 'trialing'
  LIMIT 1
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();