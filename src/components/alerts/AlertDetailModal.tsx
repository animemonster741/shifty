import { useState } from 'react';
import { IgnoredAlert, Comment } from '@/types';
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
  Server,
  Monitor,
  Users,
  MessageSquare,
  Send,
  FileText,
  Edit,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { mockComments } from '@/data/mockData';
import { toast } from 'sonner';

interface AlertDetailModalProps {
  alert: IgnoredAlert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditAlert?: (alert: IgnoredAlert) => void;
}

export function AlertDetailModal({ alert, open, onOpenChange, onEditAlert }: AlertDetailModalProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);

  if (!alert) return null;

  const alertComments = comments.filter(c => c.parentId === alert.id && c.parentType === 'alert');
  const hoursRemaining = differenceInHours(alert.ignoreUntil, new Date());

  const getStatusColor = () => {
    if (hoursRemaining < 1) return 'critical';
    if (hoursRemaining < 6) return 'warning';
    return 'active';
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `c-${Date.now()}`,
      parentId: alert.id,
      parentType: 'alert',
      text: newComment,
      addedBy: user?.employeeId || '',
      addedByName: user?.fullName || '',
      createdTime: new Date(),
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    toast.success('Comment added');
  };

  const isEditable = alert.status === 'active' || alert.status === 'pending';

  const handleEdit = () => {
    if (onEditAlert && isEditable) {
      onOpenChange(false);
      onEditAlert(alert);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl">Alert Details</DialogTitle>
            <div className="flex items-center gap-2">
              {isEditable && onEditAlert && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Badge variant={getStatusColor()}>
                {alert.status === 'pending' ? 'Pending Approval' : 
                 hoursRemaining < 1 ? 'Critical' : 
                 hoursRemaining < 6 ? 'Expiring Soon' : 'Active'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="stat-card">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4" />
                Created
              </div>
              <p className="font-medium">{format(alert.createdTime, 'PPpp')}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(alert.createdTime, { addSuffix: true })}
              </p>
            </div>
            <div className={cn(
              "stat-card",
              hoursRemaining < 1 && "!border-destructive/50",
              hoursRemaining < 6 && hoursRemaining >= 1 && "!border-warning/50"
            )}>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4" />
                Ignore Until
              </div>
              <p className={cn(
                "font-medium",
                hoursRemaining < 1 && "text-destructive",
                hoursRemaining < 6 && hoursRemaining >= 1 && "text-warning"
              )}>
                {format(alert.ignoreUntil, 'PPpp')}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(alert.ignoreUntil, { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <User className="h-4 w-4" />
                Added By
              </div>
              <p className="font-medium">{alert.addedByName}</p>
              <p className="text-xs text-muted-foreground">ID: {alert.addedBy}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <FileText className="h-4 w-4" />
                Instruction Given By
              </div>
              <p className="font-medium">{alert.instructionGivenBy}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                Team
              </div>
              <Badge variant="secondary">{alert.team}</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Server className="h-4 w-4" />
                System
              </div>
              <p className="font-mono text-sm">{alert.system}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Monitor className="h-4 w-4" />
                Device Name
              </div>
              <p className="font-mono text-sm">{alert.deviceName}</p>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold">Summary</h4>
            <p className="text-sm leading-relaxed">{alert.summary}</p>
          </div>

          {alert.fullAlertPaste && (
            <div className="space-y-2">
              <h4 className="font-semibold">Full Alert Text</h4>
              <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap">
                {alert.fullAlertPaste}
              </pre>
            </div>
          )}

          {alert.notes && (
            <div className="space-y-2">
              <h4 className="font-semibold">Notes</h4>
              <p className="text-sm text-muted-foreground">{alert.notes}</p>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({alertComments.length})
            </h4>

            {alertComments.length > 0 && (
              <div className="space-y-3">
                {alertComments.map((comment) => (
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
