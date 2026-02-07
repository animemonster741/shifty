-- Create knowledge_base_items table
CREATE TABLE public.knowledge_base_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('file', 'link')),
  url TEXT,
  file_path TEXT,
  file_name TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view knowledge base items"
ON public.knowledge_base_items
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert knowledge base items"
ON public.knowledge_base_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Admins can update knowledge base items"
ON public.knowledge_base_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Admins can delete knowledge base items"
ON public.knowledge_base_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));

-- Create trigger for updated_at
CREATE TRIGGER update_knowledge_base_items_updated_at
BEFORE UPDATE ON public.knowledge_base_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for knowledge base files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-base', 'knowledge-base', true);

-- Storage policies
CREATE POLICY "Anyone can view knowledge base files"
ON storage.objects FOR SELECT
USING (bucket_id = 'knowledge-base');

CREATE POLICY "Admins can upload knowledge base files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'knowledge-base' AND 
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete knowledge base files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'knowledge-base' AND 
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
  )
);

-- Add Knowledge Base navigation tab
INSERT INTO public.navigation_tabs (tab_key, label_he, label_en, icon, display_order, is_visible, is_system, is_custom_page)
VALUES ('knowledge-base', 'בסיס ידע', 'Knowledge Base', 'BookOpen', 6, true, true, false);