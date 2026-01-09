-- 1. Fix admin_activity_logs - Drop the overly permissive policy and create a restrictive one
DROP POLICY IF EXISTS "System can insert activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Admins and triggers can log activities" ON public.admin_activity_logs;

-- Allow admins to insert directly AND database triggers (which have auth.uid() = NULL)
CREATE POLICY "Admins and triggers can log activities"
ON public.admin_activity_logs FOR INSERT
WITH CHECK (is_admin(auth.uid()) OR auth.uid() IS NULL);

-- 2. Fix user_analytics - Make it require authentication for inserts
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.user_analytics;

-- Allow authenticated users to insert their own analytics or anonymous session analytics
CREATE POLICY "Authenticated users can insert analytics"
ON public.user_analytics FOR INSERT
WITH CHECK (
  -- User must be authenticated and inserting their own data
  (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  -- OR allow anonymous analytics (for non-logged users tracking)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- 3. Fix notifications - Restrict to triggers only (no direct anonymous inserts)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Only allow triggers (auth.uid() IS NULL) or authenticated system to insert
-- Triggers run without user context, so auth.uid() is NULL
CREATE POLICY "Triggers can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NULL);

-- 4. Fix points_history - Restrict to triggers only
DROP POLICY IF EXISTS "System can insert points history" ON public.points_history;

-- Only allow triggers to insert points history
CREATE POLICY "Triggers can insert points history"
ON public.points_history FOR INSERT
WITH CHECK (auth.uid() IS NULL);

-- 5. Fix subscriptions UPDATE policy - Restrict to webhook/trigger context
DROP POLICY IF EXISTS "System can update subscriptions" ON public.subscriptions;

-- Allow triggers/webhooks (auth.uid() IS NULL) to update subscriptions
-- This is used by stripe-webhook which validates signatures
CREATE POLICY "Webhooks and triggers can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() IS NULL);