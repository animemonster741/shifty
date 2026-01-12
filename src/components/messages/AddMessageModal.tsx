import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Paperclip, X, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function AddMessageModal({ open, onOpenChange, onSubmit }: AddMessageModalProps) {
  const { user } = useAuth();
  const { t, direction } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || content === '<p></p>') {
      toast.error(t('messages.fillRequired') || 'Please fill in title and message content');
      return;
    }

    const messageData = {
      title,
      content,
      attachment: attachment?.name,
      addedBy: user?.employeeId,
      addedByName: user?.fullName,
      createdTime: new Date(),
      pinned: false,
      commentCount: 0,
    };

    onSubmit(messageData);
    onOpenChange(false);
    resetForm();
    toast.success(t('messages.posted') || 'Message posted successfully');
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setAttachment(null);
    setIsPreviewMode(false);
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={direction}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('messages.newMessage') || 'Add Important Message'}
          </DialogTitle>
          <DialogDescription>
            {t('messages.postForTeam') || 'Post an important message for the team'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('messages.title') || 'Title'} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('messages.titlePlaceholder') || 'Message title...'}
              className="input-noc"
              maxLength={200}
              dir={direction}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('messages.content') || 'Message'} *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 h-7"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? (
                  <>
                    <Edit className="h-3.5 w-3.5" />
                    {t('messages.edit') || 'Edit'}
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    {t('messages.preview') || 'Preview'}
                  </>
                )}
              </Button>
            </div>
            
            {isPreviewMode ? (
              <div 
                className={cn(
                  "min-h-[200px] p-4 border border-input rounded-md bg-background/50",
                  "prose prose-sm dark:prose-invert max-w-none",
                  "[&_table]:border-collapse [&_table]:w-full",
                  "[&_td]:border [&_td]:border-border [&_td]:p-2",
                  "[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted/50 [&_th]:font-semibold",
                  "[&_ul]:list-disc [&_ul]:ps-5",
                  "[&_ol]:list-decimal [&_ol]:ps-5"
                )}
                dir={direction}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder={t('messages.contentPlaceholder') || 'Write your message here...'}
                maxLength={10000}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">{t('messages.attachment') || 'Attachment'} ({t('common.optional') || 'Optional'})</Label>
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
              {t('messages.attachmentLimits') || 'Images: max 10MB (.jpg, .png, .gif) | Documents: max 25MB (.pdf, .txt, .log, .csv)'}
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button type="submit">{t('messages.post') || 'Post Message'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
