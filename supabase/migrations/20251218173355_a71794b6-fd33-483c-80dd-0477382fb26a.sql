-- Add sponsored flag to restaurants
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsor_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS sponsor_end_date timestamp with time zone;

-- Create user_searches table to track search history for suggestions
CREATE TABLE IF NOT EXISTS public.user_searches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  search_query text NOT NULL,
  filters jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_searches ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_searches
CREATE POLICY "Users can view their own searches"
ON public.user_searches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own searches"
ON public.user_searches FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create user_analytics table for heatmap/behavior tracking
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  session_id text NOT NULL,
  event_type text NOT NULL,
  page_path text NOT NULL,
  element_id text,
  element_class text,
  x_position integer,
  y_position integer,
  viewport_width integer,
  viewport_height integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policy - only admins can view analytics
CREATE POLICY "Admins can view all analytics"
ON public.user_analytics FOR SELECT
USING (is_admin(auth.uid()));

-- Anyone can insert analytics (for tracking)
CREATE POLICY "Anyone can insert analytics"
ON public.user_analytics FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_page_path ON public.user_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_user_searches_user_id ON public.user_searches(user_id);