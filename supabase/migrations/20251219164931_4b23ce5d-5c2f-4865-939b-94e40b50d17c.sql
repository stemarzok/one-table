-- Add gallery_images column to restaurants table for carousel images (max 10)
ALTER TABLE public.restaurants 
ADD COLUMN gallery_images text[] DEFAULT '{}'::text[];