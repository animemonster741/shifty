import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';

interface AddMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddMessageModal({ open, onOpenChange, onSubmit }: AddMessageModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in title and message content');
      return;
    }

    const messageData = {
      title,
      content,
      attachment: attachment?.name,
      addedBy: user?.employeeId,
      addedByName: user?.name,
      createdTime: new Date(),
      pinned: false,
      commentCount: 0,
    };

    onSubmit(messageData);
    onOpenChange(false);
    resetForm();
    toast.success('Message posted successfully');
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setAttachment(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File size exceeds ${file.type.startsWith('image/') ? '10MB' : '25MB'} limit`);
        return;
      }
      setAttachment(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Add Important Message
          </DialogTitle>
          <DialogDescription>
            Post an important message for the team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Message title..."
              className="input-noc"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message here... (Markdown supported)"
              rows={8}
              className="input-noc resize-none"
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/5000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            {attachment ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1 truncate">{attachment.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAttachment(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.log,.csv"
                className="input-noc"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Images: max 10MB (.jpg, .png, .gif) | Documents: max 25MB (.pdf, .txt, .log, .csv)
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Post Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
