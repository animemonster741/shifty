import { useState } from 'react';
import { ImportantMessage, Comment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  User,
  Pin,
  MessageSquare,
  Send,
  Paperclip,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockComments } from '@/data/mockData';
import { toast } from 'sonner';

interface MessageDetailModalProps {
  message: ImportantMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPin?: (messageId: string) => void;
}

export function MessageDetailModal({ message, open, onOpenChange, onPin }: MessageDetailModalProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);

  if (!message) return null;

  const messageComments = comments.filter(c => c.parentId === message.id && c.parentType === 'message');
  const isAdmin = user?.role === 'admin';

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c-${Date.now()}`,
      parentId: message.id,
      parentType: 'message',
      text: newComment,
      addedBy: user?.employeeId || '',
      addedByName: user?.fullName || '',
      createdTime: new Date(),
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    toast.success('Comment added');
  };

  const handlePin = () => {
    if (onPin) {
      onPin(message.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {message.pinned && (
                  <Pin className="h-4 w-4 text-primary shrink-0" />
                )}
                <DialogTitle className="text-xl">{message.title}</DialogTitle>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {message.addedByName}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(message.createdTime, 'PPpp')}
                </span>
              </div>
            </div>
            {isAdmin && (
              <Button
                variant={message.pinned ? 'default' : 'outline'}
                size="sm"
                onClick={handlePin}
                className="shrink-0"
              >
                <Pin className={cn('h-4 w-4 mr-1', message.pinned && 'fill-current')} />
                {message.pinned ? 'Unpin' : 'Pin'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>

          {/* Attachment */}
          {message.attachmentFilename && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">{message.attachmentFilename}</span>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({messageComments.length})
            </h4>

            {messageComments.length > 0 && (
              <div className="space-y-3">
                {messageComments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comment.addedByName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdTime, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input-noc"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="icon" onClick={handleAddComment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
