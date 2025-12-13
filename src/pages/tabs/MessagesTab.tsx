import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ImportantMessage } from '@/types';
import { mockMessages } from '@/data/mockData';
import { MessageCard } from '@/components/messages/MessageCard';
import { AddMessageModal } from '@/components/messages/AddMessageModal';
import { MessageDetailModal } from '@/components/messages/MessageDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pin } from 'lucide-react';
import { toast } from 'sonner';

export function MessagesTab() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ImportantMessage[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ImportantMessage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const pinnedMessages = messages.filter(m => m.pinned);
  const unpinnedMessages = messages.filter(m => !m.pinned);

  const filteredPinned = pinnedMessages.filter(msg =>
    msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnpinned = unpinnedMessages.filter(msg =>
    msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-6 animate-fade-in">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="pl-9 input-noc"
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Pinned messages section */}
      {filteredPinned.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Pin className="h-4 w-4" />
            Pinned Messages
          </div>
          <div className="grid gap-4">
            {filteredPinned.map((message) => (
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
      {filteredUnpinned.length > 0 && (
        <div className="space-y-4">
          {filteredPinned.length > 0 && (
            <div className="text-sm font-medium text-muted-foreground">
              All Messages
            </div>
          )}
          <div className="grid gap-4">
            {filteredUnpinned.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onViewDetails={() => handleViewMessage(message)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredPinned.length === 0 && filteredUnpinned.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No messages found</p>
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
