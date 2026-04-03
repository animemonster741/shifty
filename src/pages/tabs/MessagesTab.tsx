import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { ImportantMessage } from '@/types';
import { MessageCard } from '@/components/messages/MessageCard';
import { AddMessageModal } from '@/components/messages/AddMessageModal';
import { MessageDetailModal } from '@/components/messages/MessageDetailModal';
import { Button } from '@/components/ui/button';
import { Plus, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function MessagesTab() {
  const { user } = useAuth();
  const { t, direction } = useLanguage();
  const { filterMessages, setMessageCount, globalSearchQuery } = useGlobalSearch();
  const [messages, setMessages] = useState<ImportantMessage[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ImportantMessage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('important_messages')
        .select('*')
        .order('created_time', { ascending: false });
      if (error) throw error;

      const rows = (data || []) as any[];
      const mapped: ImportantMessage[] = rows.map((r) => ({
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
      setMessages(mapped);
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  }, []);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('important_messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'important_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  // Apply global search filter
  const filteredMessages = useMemo(() => filterMessages(messages), [messages, filterMessages]);
  
  const pinnedMessages = filteredMessages.filter(m => m.pinned);
  const unpinnedMessages = filteredMessages.filter(m => !m.pinned);

  // Update result counts for cross-tab notification
  useEffect(() => {
    setMessageCount(filteredMessages.length);
  }, [filteredMessages.length, setMessageCount]);

  const handleAddMessage = async (data: any) => {
    if (!user?.id || !user.employeeId || !user.fullName) {
      throw new Error('Not authenticated');
    }

    const payload = {
      title: String(data.title ?? '').trim(),
      content: String(data.content ?? ''),
      created_by: user.id,
      added_by: user.employeeId,
      added_by_name: user.fullName,
      created_time: new Date().toISOString(),
      pinned: false,
      comment_count: 0,
    };

    const { error } = await (supabase as any).from('important_messages').insert(payload);
    if (error) throw error;
  };

  const handleViewMessage = (message: ImportantMessage) => {
    setSelectedMessage(message);
    setIsDetailModalOpen(true);
  };

  const handlePinMessage = async (messageId: string) => {
    const pinnedCount = messages.filter(m => m.pinned && m.id !== messageId).length;
    const message = messages.find(m => m.id === messageId);
    
    if (!message) return;

    if (!message.pinned && pinnedCount >= 5) {
      toast.error('Maximum 5 pinned messages allowed. Please unpin another message first.');
      return;
    }

    try {
      const now = new Date();
      const nextPinned = !message.pinned;
      const { error } = await (supabase as any)
        .from('important_messages')
        .update({
          pinned: nextPinned,
          pinned_by: nextPinned ? user?.employeeId : null,
          pinned_time: nextPinned ? now.toISOString() : null,
          modified_by: user?.employeeId ?? null,
          modified_time: now.toISOString(),
        })
        .eq('id', messageId);
      if (error) throw error;
      toast.success(message.pinned ? 'Message unpinned' : 'Message pinned');
    } catch (e: any) {
      console.error('Pin update failed:', e);
      toast.error(e?.message ?? 'Failed to update pin');
    }

  };

  return (
    <div className="space-y-6 animate-fade-in" dir={direction}>
      {/* Actions bar */}
      <div className="flex justify-end">
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 me-2" />
          {t('messages.newMessage')}
        </Button>
      </div>

      {/* Pinned messages section */}
      {pinnedMessages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Pin className="h-4 w-4" />
            {t('messages.pinnedMessages')}
          </div>
          <div className="grid gap-4">
            {pinnedMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onViewDetails={() => handleViewMessage(message)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular messages */}
      {unpinnedMessages.length > 0 && (
        <div className="space-y-4">
          {pinnedMessages.length > 0 && (
            <div className="text-sm font-medium text-muted-foreground">
              {t('messages.allMessages')}
            </div>
          )}
          <div className="grid gap-4">
            {unpinnedMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onViewDetails={() => handleViewMessage(message)}
              />
            ))}
          </div>
        </div>
      )}

      {pinnedMessages.length === 0 && unpinnedMessages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground space-y-2">
            <p className="font-medium">{t('search.noResults')}</p>
            {globalSearchQuery && (
              <p className="text-sm">{t('search.noResultsDesc')}</p>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddMessageModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddMessage}
      />
      <MessageDetailModal
        message={selectedMessage}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onPin={handlePinMessage}
      />
    </div>
  );
}
