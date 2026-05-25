
-- 1) Make knowledge-base bucket private
UPDATE storage.buckets SET public = false WHERE id = 'knowledge-base';

-- 2) Storage object policies for knowledge-base
DROP POLICY IF EXISTS "Authenticated users can view knowledge base files" ON storage.objects;
CREATE POLICY "Authenticated users can view knowledge base files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'knowledge-base');

DROP POLICY IF EXISTS "Admins can upload knowledge base files" ON storage.objects;
CREATE POLICY "Admins can upload knowledge base files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'knowledge-base' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update knowledge base files" ON storage.objects;
CREATE POLICY "Admins can update knowledge base files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'knowledge-base' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete knowledge base files" ON storage.objects;
CREATE POLICY "Admins can delete knowledge base files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'knowledge-base' AND public.has_role(auth.uid(), 'admin'));

-- 3) Restrict user_roles policies to authenticated role (was {public})
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
