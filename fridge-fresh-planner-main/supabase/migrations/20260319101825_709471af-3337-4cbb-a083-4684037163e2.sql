
-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('fridge', 'freezer', 'shelf')),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'шт',
  icon TEXT NOT NULL DEFAULT '🍽️',
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth required)
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- Insert sample data
INSERT INTO public.products (name, location, quantity, unit, icon, expiry_date) VALUES
  ('Молоко 3.2%', 'fridge', 1, 'шт', '🥛', now()::date + 5),
  ('Авокадо', 'fridge', 2, 'шт', '🥑', now()::date + 2),
  ('Куриное филе', 'fridge', 500, 'г', '🍗', now()::date + 3),
  ('Яйца С0', 'fridge', 8, 'шт', '🥚', now()::date + 14),
  ('Пельмени', 'freezer', 1, 'уп', '🥟', now()::date + 90),
  ('Мороженое', 'freezer', 2, 'шт', '🍦', now()::date + 60),
  ('Замороженные ягоды', 'freezer', 300, 'г', '🫐', now()::date + 120),
  ('Макароны', 'shelf', 1, 'уп', '🍝', now()::date + 365),
  ('Рис', 'shelf', 900, 'г', '🍚', now()::date + 300),
  ('Оливковое масло', 'shelf', 1, 'бут', '🫒', now()::date + 180);
