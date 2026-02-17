
-- Token Registry table
CREATE TABLE public.tokens_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  company TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  token_type TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tokens_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tokens registry"
ON public.tokens_registry FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert tokens registry"
ON public.tokens_registry FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tokens registry"
ON public.tokens_registry FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tokens registry"
ON public.tokens_registry FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_tokens_registry_updated_at
BEFORE UPDATE ON public.tokens_registry
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Token Activity Log table
CREATE TABLE public.token_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requestor_id UUID NOT NULL REFERENCES public.tokens_registry(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.token_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view token activity log"
ON public.token_activity_log FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert token activity log"
ON public.token_activity_log FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update token activity log"
ON public.token_activity_log FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete token activity log"
ON public.token_activity_log FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
