-- Add edited fields to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;

-- Create review_likes table for like/dislike system
CREATE TABLE IF NOT EXISTS public.review_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_like boolean NOT NULL, -- true = like, false = dislike
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_likes
CREATE POLICY "Anyone can view likes count" 
ON public.review_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Logged in users can add likes" 
ON public.review_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own likes" 
ON public.review_likes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.review_likes 
FOR DELETE 
USING (auth.uid() = user_id);