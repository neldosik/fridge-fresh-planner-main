ALTER TABLE public.products ADD COLUMN max_quantity integer NOT NULL DEFAULT 1;
UPDATE public.products SET max_quantity = quantity;