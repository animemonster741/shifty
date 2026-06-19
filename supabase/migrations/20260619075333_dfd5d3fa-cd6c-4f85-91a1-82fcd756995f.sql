
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete custom pages" ON public.custom_pages;
DROP POLICY IF EXISTS "Admins can insert custom pages" ON public.custom_pages;
DROP POLICY IF EXISTS "Admins can update custom pages" ON public.custom_pages;
DROP POLICY IF EXISTS "Anyone can view custom pages" ON public.custom_pages;
CREATE POLICY "Admins can delete custom pages" ON public.custom_pages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert custom pages" ON public.custom_pages FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update custom pages" ON public.custom_pages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view custom pages" ON public.custom_pages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can delete knowledge base items" ON public.knowledge_base_items;
DROP POLICY IF EXISTS "Admins can insert knowledge base items" ON public.knowledge_base_items;
DROP POLICY IF EXISTS "Admins can update knowledge base items" ON public.knowledge_base_items;
DROP POLICY IF EXISTS "Authenticated users can view knowledge base items" ON public.knowledge_base_items;
CREATE POLICY "Admins can delete knowledge base items" ON public.knowledge_base_items FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert knowledge base items" ON public.knowledge_base_items FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update knowledge base items" ON public.knowledge_base_items FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view knowledge base items" ON public.knowledge_base_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can delete non-system navigation tabs" ON public.navigation_tabs;
DROP POLICY IF EXISTS "Admins can insert navigation tabs" ON public.navigation_tabs;
DROP POLICY IF EXISTS "Admins can update navigation tabs" ON public.navigation_tabs;
DROP POLICY IF EXISTS "Anyone can view visible navigation tabs" ON public.navigation_tabs;
CREATE POLICY "Admins can delete non-system navigation tabs" ON public.navigation_tabs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) AND (is_system IS NOT TRUE));
CREATE POLICY "Admins can insert navigation tabs" ON public.navigation_tabs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update navigation tabs" ON public.navigation_tabs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view visible navigation tabs" ON public.navigation_tabs FOR SELECT TO authenticated USING (is_visible = true OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete entries" ON public.room_access_entries;
DROP POLICY IF EXISTS "Admins can update entries" ON public.room_access_entries;
DROP POLICY IF EXISTS "Authenticated users can insert entries" ON public.room_access_entries;
DROP POLICY IF EXISTS "Authenticated users can view entries" ON public.room_access_entries;
CREATE POLICY "Admins can delete entries" ON public.room_access_entries FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update entries" ON public.room_access_entries FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can insert entries" ON public.room_access_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view entries" ON public.room_access_entries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
CREATE POLICY "Admins can manage rooms" ON public.rooms FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view rooms" ON public.rooms FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage approvers" ON public.access_approvers;
DROP POLICY IF EXISTS "Anyone can view approvers" ON public.access_approvers;
CREATE POLICY "Admins can manage approvers" ON public.access_approvers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can view approvers" ON public.access_approvers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view knowledge base files" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
