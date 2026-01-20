-- Create navigation_tabs table for dynamic tab management
CREATE TABLE public.navigation_tabs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tab_key TEXT NOT NULL UNIQUE,
  label_he TEXT NOT NULL,
  label_en TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'FileText',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT true,
  is_custom_page BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_pages table for rich text content
CREATE TABLE public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tab_id UUID NOT NULL REFERENCES public.navigation_tabs(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.navigation_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Navigation tabs policies
CREATE POLICY "Anyone can view visible navigation tabs"
ON public.navigation_tabs
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert navigation tabs"
ON public.navigation_tabs
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can update navigation tabs"
ON public.navigation_tabs
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can delete non-system navigation tabs"
ON public.navigation_tabs
FOR DELETE
USING (
  is_system = false
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Custom pages policies
CREATE POLICY "Anyone can view custom pages"
ON public.custom_pages
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert custom pages"
ON public.custom_pages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can update custom pages"
ON public.custom_pages
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can delete custom pages"
ON public.custom_pages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
));

-- Triggers for updated_at
CREATE TRIGGER update_navigation_tabs_updated_at
  BEFORE UPDATE ON public.navigation_tabs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_pages_updated_at
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system tabs
INSERT INTO public.navigation_tabs (tab_key, label_he, label_en, icon, display_order, is_visible, is_system, is_custom_page) VALUES
  ('alerts', 'התראות מושהות', 'Paused Alerts', 'AlertTriangle', 1, true, true, false),
  ('messages', 'הודעות חשובות', 'Important Messages', 'MessageSquare', 2, true, true, false),
  ('links', 'קישורים שימושיים', 'Useful Links', 'ExternalLink', 3, true, true, false),
  ('statistics', 'סטטיסטיקות', 'Statistics', 'BarChart3', 4, true, true, false),
  ('archive', 'ארכיון', 'Archive', 'Archive', 5, true, true, false),
  ('logs', 'היסטוריה', 'History', 'History', 6, true, true, false);