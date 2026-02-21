
-- Add columns to support internal application links
ALTER TABLE public.useful_links ADD COLUMN is_internal boolean NOT NULL DEFAULT false;
ALTER TABLE public.useful_links ADD COLUMN internal_route text;
