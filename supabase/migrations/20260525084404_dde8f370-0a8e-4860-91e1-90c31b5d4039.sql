
CREATE TABLE IF NOT EXISTS public.important_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by TEXT NOT NULL,
  added_by_name TEXT NOT NULL,
  created_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attachment_url TEXT,
  attachment_filename TEXT,
  attachment_type TEXT,
  pinned BOOLEAN NOT NULL DEFAULT false,
  pinned_by TEXT,
  pinned_time TIMESTAMP WITH TIME ZONE,
  modified_by TEXT,
  modified_time TIMESTAMP WITH TIME ZONE,
  comment_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.important_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view important messages" ON public.important_messages;
CREATE POLICY "Authenticated users can view important messages"
ON public.important_messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create their own important messages" ON public.important_messages;
CREATE POLICY "Users can create their own important messages"
ON public.important_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators or admins can update important messages" ON public.important_messages;
CREATE POLICY "Creators or admins can update important messages"
ON public.important_messages FOR UPDATE TO authenticated
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete important messages" ON public.important_messages;
CREATE POLICY "Admins can delete important messages"
ON public.important_messages FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.ignored_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_secondary BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by TEXT NOT NULL,
  added_by_name TEXT NOT NULL,
  created_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  team TEXT NOT NULL,
  system TEXT NOT NULL DEFAULT '',
  device_name TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  full_alert_paste TEXT,
  instruction_given_by TEXT NOT NULL,
  ignore_until TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'deleted')),
  modified_by TEXT,
  modified_by_name TEXT,
  modified_time TIMESTAMP WITH TIME ZONE,
  archived_time TIMESTAMP WITH TIME ZONE,
  archive_reason TEXT,
  approved_by TEXT,
  approval_time TIMESTAMP WITH TIME ZONE,
  comment_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.ignored_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view ignored alerts" ON public.ignored_alerts;
CREATE POLICY "Authenticated users can view ignored alerts"
ON public.ignored_alerts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create their own ignored alerts" ON public.ignored_alerts;
CREATE POLICY "Users can create their own ignored alerts"
ON public.ignored_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators or admins can update ignored alerts" ON public.ignored_alerts;
CREATE POLICY "Creators or admins can update ignored alerts"
ON public.ignored_alerts FOR UPDATE TO authenticated
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete ignored alerts" ON public.ignored_alerts;
CREATE POLICY "Admins can delete ignored alerts"
ON public.ignored_alerts FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.important_messages;
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ignored_alerts;
  EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL;
  END;
END $$;
