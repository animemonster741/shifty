
-- Add access_only flag to profiles
ALTER TABLE public.profiles ADD COLUMN is_access_only boolean NOT NULL DEFAULT false;
