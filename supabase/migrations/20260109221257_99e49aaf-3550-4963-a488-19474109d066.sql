-- Add CHECK constraint to user_analytics for valid event types (including existing types)
ALTER TABLE public.user_analytics
  ADD CONSTRAINT valid_event_type CHECK (event_type IN (
    'click',
    'scroll',
    'scroll_depth',
    'page_view',
    'form_submit',
    'navigation',
    'error',
    'search',
    'filter',
    'booking',
    'review'
  ));