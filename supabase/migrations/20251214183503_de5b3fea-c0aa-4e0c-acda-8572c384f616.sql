-- Create review reports table for moderation
CREATE TABLE public.review_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

-- Restaurant staff can create reports
CREATE POLICY "Restaurant staff can create reports"
ON public.review_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_roles
    WHERE user_id = auth.uid()
    AND restaurant_id = review_reports.restaurant_id
  )
);

-- Restaurant staff can view their own reports
CREATE POLICY "Restaurant staff can view their reports"
ON public.review_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.business_roles
    WHERE user_id = auth.uid()
    AND restaurant_id = review_reports.restaurant_id
  )
);

-- Admins can manage all reports
CREATE POLICY "Admins can manage all reports"
ON public.review_reports
FOR ALL
USING (is_admin(auth.uid()));

-- Add index for faster lookups
CREATE INDEX idx_review_reports_review_id ON public.review_reports(review_id);
CREATE INDEX idx_review_reports_status ON public.review_reports(status);