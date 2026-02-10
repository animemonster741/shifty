
-- Rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Admins can manage rooms" ON public.rooms FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Access approvers table
CREATE TABLE public.access_approvers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.access_approvers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approvers" ON public.access_approvers FOR SELECT USING (true);
CREATE POLICY "Admins can manage approvers" ON public.access_approvers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Room access entries table
CREATE TABLE public.room_access_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  authorized_personnel TEXT[] NOT NULL DEFAULT '{}',
  room_ids UUID[] NOT NULL DEFAULT '{}',
  reason TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  approver_id UUID REFERENCES public.access_approvers(id),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.room_access_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view entries" ON public.room_access_entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert entries" ON public.room_access_entries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update entries" ON public.room_access_entries FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete entries" ON public.room_access_entries FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_room_access_entries_updated_at
  BEFORE UPDATE ON public.room_access_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rooms
INSERT INTO public.rooms (name, display_order) VALUES
  ('אולם א''', 1),
  ('אולם ב''', 2),
  ('אולם ג''', 3),
  ('אולם ד''', 4),
  ('אולם ה''', 5),
  ('אולם ו''', 6),
  ('אולם ז''', 7);

-- Add navigation tab
INSERT INTO public.navigation_tabs (tab_key, label_he, label_en, icon, display_order, is_visible, is_system, is_custom_page)
VALUES ('room-access', 'ניהול כניסה', 'Access Management', 'KeyRound', 7, true, true, false);
