ALTER TABLE public.products ALTER COLUMN quantity TYPE numeric USING quantity::numeric;
ALTER TABLE public.products ALTER COLUMN max_quantity TYPE numeric USING max_quantity::numeric;