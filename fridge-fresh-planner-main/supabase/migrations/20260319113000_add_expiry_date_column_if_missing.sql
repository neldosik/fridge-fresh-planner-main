-- Ensure expiry_date exists on products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS expiry_date DATE;

