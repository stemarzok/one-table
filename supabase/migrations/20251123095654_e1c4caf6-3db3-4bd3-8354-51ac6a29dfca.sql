-- Add photos column to reviews table
ALTER TABLE public.reviews 
ADD COLUMN photos TEXT[];

-- Create restaurant review responses table
CREATE TABLE public.review_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on review_responses
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_responses
CREATE POLICY "Anyone can view review responses"
ON public.review_responses
FOR SELECT
USING (true);

CREATE POLICY "Restaurant staff can create responses"
ON public.review_responses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_roles
    WHERE user_id = auth.uid()
    AND restaurant_id = review_responses.restaurant_id
  )
);

CREATE POLICY "Restaurant staff can update their responses"
ON public.review_responses
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Restaurant staff can delete their responses"
ON public.review_responses
FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.business_roles
    WHERE user_id = auth.uid()
    AND restaurant_id = notifications.restaurant_id
  )
);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.business_roles
    WHERE user_id = auth.uid()
    AND restaurant_id = notifications.restaurant_id
  )
);

-- Create trigger for updated_at on review_responses
CREATE TRIGGER update_review_responses_updated_at
BEFORE UPDATE ON public.review_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create notification when review is posted
CREATE OR REPLACE FUNCTION public.notify_restaurant_new_review()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Get restaurant owner and staff
  INSERT INTO public.notifications (user_id, restaurant_id, type, title, message, link)
  SELECT 
    br.user_id,
    NEW.restaurant_id,
    'new_review',
    'Nuova recensione',
    'Hai ricevuto una nuova recensione',
    '/dashboard?tab=reviews'
  FROM public.business_roles br
  WHERE br.restaurant_id = NEW.restaurant_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new reviews
CREATE TRIGGER notify_restaurant_on_new_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_restaurant_new_review();

-- Add index for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_restaurant_id ON public.notifications(restaurant_id);
CREATE INDEX idx_review_responses_review_id ON public.review_responses(review_id);