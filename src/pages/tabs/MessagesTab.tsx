import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { ImportantMessage } from '@/types';
import { mockMessages } from '@/data/mockData';
import { MessageCard } from '@/components/messages/MessageCard';
import { AddMessageModal } from '@/components/messages/AddMessageModal';
import { MessageDetailModal } from '@/components/messages/MessageDetailModal';
import { Button } from '@/components/ui/button';
import { Plus, Pin } from 'lucide-react';
import { toast } from 'sonner';

export function MessagesTab() {
  const { user } = useAuth();
  const { t, direction } = useLanguage();
  const { filterMessages, setMessageCount, globalSearchQuery } = useGlobalSearch();
  const [messages, setMessages] = useState<ImportantMessage[]>(mockMessages);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ImportantMessage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Apply global search filter
  const filteredMessages = useMemo(() => filterMessages(messages), [messages, filterMessages]);
  
  const pinnedMessages = filteredMessages.filter(m => m.pinned);
  const unpinnedMessages = filteredMessages.filter(m => !m.pinned);

  // Update result counts for cross-tab notification
  useEffect(() => {
    setMessageCount(filteredMessages.length);
  }, [filteredMessages.length, setMessageCount]);

  const handleAddMessage = (data: any) => {
    const newMessage: ImportantMessage = {
      id: `msg-${Date.now()}`,
      ...data,
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const handleViewMessage = (message: ImportantMessage) => {
    setSelectedMessage(message);
    setIsDetailModalOpen(true);
  };

  const handlePinMessage = (messageId: string) => {
    const pinnedCount = messages.filter(m => m.pinned && m.id !== messageId).length;
    const message = messages.find(m => m.id === messageId);
    
    if (!message) return;

    if (!message.pinned && pinnedCount >= 5) {
      toast.error('Maximum 5 pinned messages allowed. Please unpin another message first.');
      return;
    }

    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          pinned: !m.pinned,
          pinnedBy: !m.pinned ? user?.employeeId : undefined,
          pinnedTime: !m.pinned ? new Date() : undefined,
        };
      }
      return m;
    }));

    toast.success(message.pinned ? 'Message unpinned' : 'Message pinned');
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
