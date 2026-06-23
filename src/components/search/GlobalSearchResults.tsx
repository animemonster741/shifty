import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { IgnoredAlert, ImportantMessage } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, MessageSquare, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he as heLocale, enUS } from 'date-fns/locale';
import { sanitizeHTML } from '@/utils/sanitize';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import { MessageDetailModal } from '@/components/messages/MessageDetailModal';

type UnifiedResult =
  | { kind: 'alert'; date: Date; data: IgnoredAlert }
  | { kind: 'message'; date: Date; data: ImportantMessage };

export function GlobalSearchResults() {
  const { globalSearchQuery, filterAlerts, filterMessages } = useGlobalSearch();
  const { language, direction, t } = useLanguage();
  const isHe = language === 'he';
  const locale = isHe ? heLocale : enUS;

  const [alerts, setAlerts] = useState<IgnoredAlert[]>([]);
  const [messages, setMessages] = useState<ImportantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAlert, setSelectedAlert] = useState<IgnoredAlert | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ImportantMessage | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: alertRows }, { data: msgRows }] = await Promise.all([
        (supabase as any).from('ignored_alerts').select('*').order('created_time', { ascending: false }),
        (supabase as any).from('important_messages').select('*').order('created_time', { ascending: false }),
      ]);

      const mappedAlerts: IgnoredAlert[] = ((alertRows || []) as any[]).map((r) => ({
        id: r.id,
        addedBy: r.added_by,
        addedByName: r.added_by_name,
        createdTime: new Date(r.created_time),
        team: r.team,
        system: r.system ?? '',
        deviceName: r.device_name ?? '',
        summary: r.summary ?? '',
        fullAlertPaste: r.full_alert_paste ?? undefined,
        instructionGivenBy: r.instruction_given_by,
        ignoreUntil: new Date(r.ignore_until),
        notes: r.notes ?? undefined,
        status: r.status,
        modifiedBy: r.modified_by ?? undefined,
        modifiedByName: r.modified_by_name ?? undefined,
        modifiedTime: r.modified_time ? new Date(r.modified_time) : undefined,
        archivedTime: r.archived_time ? new Date(r.archived_time) : undefined,
        archiveReason: r.archive_reason ?? undefined,
        approvedBy: r.approved_by ?? undefined,
        approvalTime: r.approval_time ? new Date(r.approval_time) : undefined,
        commentCount: r.comment_count ?? 0,
        changeLogs: [],
      }));

      const mappedMessages: ImportantMessage[] = ((msgRows || []) as any[]).map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        addedBy: r.added_by,
        addedByName: r.added_by_name,
        createdTime: new Date(r.created_time),
        attachmentUrl: r.attachment_url ?? undefined,
        attachmentFilename: r.attachment_filename ?? undefined,
        attachmentType: r.attachment_type ?? undefined,
        pinned: !!r.pinned,
        pinnedBy: r.pinned_by ?? undefined,
        pinnedTime: r.pinned_time ? new Date(r.pinned_time) : undefined,
        modifiedBy: r.modified_by ?? undefined,
        modifiedTime: r.modified_time ? new Date(r.modified_time) : undefined,
        commentCount: r.comment_count ?? 0,
      }));

      setAlerts(mappedAlerts);
      setMessages(mappedMessages);
    } catch (e) {
      console.error('Search fetch failed:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel('global_search_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ignored_alerts' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'important_messages' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const results: UnifiedResult[] = useMemo(() => {
    const filteredAlerts = filterAlerts(alerts);
    const filteredMessages = filterMessages(messages);
    const combined: UnifiedResult[] = [
      ...filteredAlerts.map((a) => ({ kind: 'alert' as const, date: a.createdTime, data: a })),
      ...filteredMessages.map((m) => ({ kind: 'message' as const, date: m.createdTime, data: m })),
    ];
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [alerts, messages, filterAlerts, filterMessages]);

  return (
    <div className="space-y-4 animate-fade-in" dir={direction}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isHe ? 'תוצאות חיפוש' : 'Search results'}
          <span className="ms-2 text-sm font-normal text-muted-foreground">
            {isHe ? `עבור "${globalSearchQuery}"` : `for "${globalSearchQuery}"`}
          </span>
        </h2>
        {!isLoading && (
          <Badge variant="secondary">
            {results.length} {isHe ? 'תוצאות' : 'results'}
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <p className="font-medium">{t('search.noResults')}</p>
          <p className="text-sm">{t('search.noResultsDesc')}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((r) =>
            r.kind === 'alert' ? (
              <Card
                key={`alert-${r.data.id}`}
                className="card-elevated cursor-pointer transition-all hover:border-primary/40"
                onClick={() => setSelectedAlert(r.data)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                      <span className="font-medium truncate">
                        {r.data.deviceName || r.data.system || r.data.summary || '-'}
                      </span>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {isHe ? 'התרעה' : 'Alert'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {r.data.summary && (
                    <p className="text-muted-foreground line-clamp-2">{r.data.summary}</p>
                  )}
                  {r.data.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium">{isHe ? 'הערות: ' : 'Notes: '}</span>
                      {r.data.notes}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                    {r.data.team && <span>{r.data.team}</span>}
                    {r.data.instructionGivenBy && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {r.data.instructionGivenBy}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(r.date, { addSuffix: true, locale })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                key={`msg-${r.data.id}`}
                className="card-elevated cursor-pointer transition-all hover:border-primary/40"
                onClick={() => setSelectedMessage(r.data)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium truncate">{r.data.title}</span>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {isHe ? 'הודעה' : 'Message'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div
                    className="message-content text-muted-foreground line-clamp-3 text-xs"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(r.data.content) }}
                  />
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                    {r.data.addedByName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {r.data.addedByName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(r.date, { addSuffix: true, locale })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      <AlertDetailModal
        alert={selectedAlert}
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        onEditAlert={() => {}}
      />
      <MessageDetailModal
        message={selectedMessage}
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
        onPin={() => {}}
      />
    </div>
  );
}
