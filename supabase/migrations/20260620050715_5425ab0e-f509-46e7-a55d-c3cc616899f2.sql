
CREATE TABLE public.system_faults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fault_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  operator_name TEXT NOT NULL,
  network TEXT NOT NULL,
  vendor TEXT NOT NULL,
  controller_name TEXT NOT NULL,
  controller_location TEXT NOT NULL,
  fault_type TEXT NOT NULL CHECK (fault_type IN ('hardware','software')),
  fault_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open_external' CHECK (status IN ('open_external','closed','frozen')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  modified_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_faults TO authenticated;
GRANT ALL ON public.system_faults TO service_role;

ALTER TABLE public.system_faults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view faults"
  ON public.system_faults FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert faults"
  ON public.system_faults FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update faults"
  ON public.system_faults FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete faults"
  ON public.system_faults FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_system_faults_updated_at
  BEFORE UPDATE ON public.system_faults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.navigation_tabs (tab_key, label_he, label_en, icon, display_order, is_visible, is_system, is_custom_page)
VALUES ('faults', 'תקלות', 'Faults', 'Wrench', 11, true, true, false);
