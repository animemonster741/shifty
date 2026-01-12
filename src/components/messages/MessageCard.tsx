import { useState } from 'react';
import { ImportantMessage } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Pin, MessageSquare, Clock, User, Paperclip, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageCardProps {
  message: ImportantMessage;
  onViewDetails: () => void;
}

export function MessageCard({ message, onViewDetails }: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const previewContent = message.content.length > 200 && !isExpanded
    ? message.content.substring(0, 200) + '...'
    : message.content;

  return (
    <Card
      className={cn(
        'card-elevated transition-all duration-200',
        message.pinned && 'border-primary/30 bg-primary/5'
      )}
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onViewDetails}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className={cn(
            "prose prose-sm dark:prose-invert max-w-none text-muted-foreground",
            "[&_table]:border-collapse [&_table]:w-full [&_table]:my-2",
            "[&_td]:border [&_td]:border-border [&_td]:p-2",
            "[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted/50 [&_th]:font-semibold",
            "[&_ul]:list-disc [&_ul]:ps-5",
            "[&_ol]:list-decimal [&_ol]:ps-5",
            "[&_p]:my-1",
            !isExpanded && "line-clamp-4"
          )}
          dangerouslySetInnerHTML={{ __html: isExpanded ? message.content : previewContent }}
        />
        {message.content.length > 200 && (
          <Button 
            variant="link" 
            className="px-0 h-auto mt-2 gap-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Read More
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
