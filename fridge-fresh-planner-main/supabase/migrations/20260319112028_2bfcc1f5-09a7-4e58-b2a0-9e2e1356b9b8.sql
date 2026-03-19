
-- Shopping list table
CREATE TABLE public.shopping_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'шт',
  estimated_price NUMERIC,
  icon TEXT NOT NULL DEFAULT '🍽️',
  checked BOOLEAN NOT NULL DEFAULT false,
  recipe_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shopping_list" ON public.shopping_list FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert shopping_list" ON public.shopping_list FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update shopping_list" ON public.shopping_list FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete shopping_list" ON public.shopping_list FOR DELETE TO public USING (true);

-- Saved recipes table
CREATE TABLE public.saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  steps JSONB NOT NULL DEFAULT '[]',
  servings INT NOT NULL DEFAULT 2,
  cook_time_minutes INT,
  calories_total INT,
  icon TEXT NOT NULL DEFAULT '🍽️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read saved_recipes" ON public.saved_recipes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert saved_recipes" ON public.saved_recipes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update saved_recipes" ON public.saved_recipes FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete saved_recipes" ON public.saved_recipes FOR DELETE TO public USING (true);

-- Meal plans table
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  day_index INT NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  recipe JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read meal_plans" ON public.meal_plans FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert meal_plans" ON public.meal_plans FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update meal_plans" ON public.meal_plans FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete meal_plans" ON public.meal_plans FOR DELETE TO public USING (true);
