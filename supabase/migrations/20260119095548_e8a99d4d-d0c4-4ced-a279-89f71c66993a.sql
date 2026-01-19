-- Create useful_links table
CREATE TABLE public.useful_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'Link',
  image_url TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.useful_links ENABLE ROW LEVEL SECURITY;

-- Everyone can view links (authenticated users)
CREATE POLICY "Authenticated users can view links" 
ON public.useful_links 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can insert links
CREATE POLICY "Admins can insert links" 
ON public.useful_links 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update links
CREATE POLICY "Admins can update links" 
ON public.useful_links 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can delete links
CREATE POLICY "Admins can delete links" 
ON public.useful_links 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_useful_links_updated_at
BEFORE UPDATE ON public.useful_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();