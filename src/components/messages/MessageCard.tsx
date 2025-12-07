import { ImportantMessage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pin, MessageSquare, Clock, User, Paperclip } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageCardProps {
  message: ImportantMessage;
  onClick: () => void;
  isExpanded?: boolean;
}

export function MessageCard({ message, onClick, isExpanded = false }: MessageCardProps) {
  const previewContent = message.content.length > 200 && !isExpanded
    ? message.content.substring(0, 200) + '...'
    : message.content;

  return (
    <Card
      className={cn(
        'card-elevated cursor-pointer transition-all duration-200 hover:shadow-lg',
        message.pinned && 'border-primary/30 bg-primary/5'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {message.pinned && (
                <Pin className="h-4 w-4 text-primary shrink-0" />
              )}
              <h3 className="font-semibold text-lg line-clamp-1">{message.title}</h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {message.addedByName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(message.createdTime, { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {message.attachmentFilename && (
              <Badge variant="outline" className="gap-1">
                <Paperclip className="h-3 w-3" />
                Attachment
              </Badge>
            )}
            {message.commentCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <MessageSquare className="h-3 w-3" />
                {message.commentCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {previewContent}
          </p>
        </div>
        {message.content.length > 200 && !isExpanded && (
          <Button variant="link" className="px-0 h-auto mt-2">
            Read More
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
