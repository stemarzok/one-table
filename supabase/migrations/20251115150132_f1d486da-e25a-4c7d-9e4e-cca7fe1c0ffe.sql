-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  cuisine_type TEXT,
  price_range TEXT,
  cover_image_url TEXT,
  logo_url TEXT,
  opening_hours JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menus table
CREATE TABLE public.menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create restaurant_tables table
CREATE TABLE public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  seats INTEGER NOT NULL,
  location TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, table_number)
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Anyone can view active restaurants"
  ON public.restaurants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can manage their restaurants"
  ON public.restaurants FOR ALL
  USING (auth.uid() = owner_id);

-- RLS Policies for menus
CREATE POLICY "Anyone can view available menu items"
  ON public.menus FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menus.restaurant_id 
      AND restaurants.is_active = true
    )
  );

CREATE POLICY "Restaurant owners can manage their menus"
  ON public.menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = menus.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );

-- RLS Policies for restaurant_tables
CREATE POLICY "Anyone can view available tables"
  ON public.restaurant_tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = restaurant_tables.restaurant_id 
      AND restaurants.is_active = true
    )
  );

CREATE POLICY "Restaurant owners can manage their tables"
  ON public.restaurant_tables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = restaurant_tables.restaurant_id 
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON public.menus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_tables_updated_at
  BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT DO NOTHING;

-- Storage policies for restaurant images
CREATE POLICY "Anyone can view restaurant images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-images');

CREATE POLICY "Restaurant owners can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'restaurant-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Restaurant owners can update their images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'restaurant-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Restaurant owners can delete their images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'restaurant-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );