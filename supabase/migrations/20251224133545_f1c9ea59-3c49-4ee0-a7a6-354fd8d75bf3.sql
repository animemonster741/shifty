-- Add unique index on employee_id for faster lookups during login
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);

-- Ensure employee_id is required and unique
ALTER TABLE public.profiles 
  ALTER COLUMN employee_id SET NOT NULL,
  ADD CONSTRAINT profiles_employee_id_unique UNIQUE (employee_id);