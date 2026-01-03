import { useState, useMemo } from 'react';
import { IgnoredAlert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Edit,
  Eye,
  Clock,
  Trash2,
} from 'lucide-react';
import { formatDistanceToNow, differenceInHours, format } from 'date-fns';
import { cn } from '@/lib/utils';

type SortField = 'instructionGivenBy' | 'team' | 'system' | 'deviceName' | 'summary' | 'notes' | 'ignoreUntil';
type SortDirection = 'asc' | 'desc';

interface AlertsTableProps {
  alerts: IgnoredAlert[];
  onViewAlert: (alert: IgnoredAlert) => void;
  onEditAlert: (alert: IgnoredAlert) => void;
  onDeleteAlert: (alertId: string) => void;
}

export function AlertsTable({ alerts, onViewAlert, onEditAlert, onDeleteAlert }: AlertsTableProps) {
  const [sortField, setSortField] = useState<SortField>('ignoreUntil');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [alerts, sortField, sortDirection]);

  const getTimeStatus = (ignoreUntil: Date) => {
    const hoursRemaining = differenceInHours(ignoreUntil, new Date());
    if (hoursRemaining < 1) return 'critical';
    if (hoursRemaining < 6) return 'warning';
    return 'normal';
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 gap-1 font-semibold hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </Button>
  );

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[160px]">
                <SortableHeader field="instructionGivenBy">Instruction Given By</SortableHeader>
              </TableHead>
              <TableHead className="w-[140px]">
                <SortableHeader field="team">Team</SortableHeader>
              </TableHead>
              <TableHead className="w-[120px]">
                <SortableHeader field="system">System</SortableHeader>
              </TableHead>
              <TableHead className="w-[140px]">
                <SortableHeader field="deviceName">Device</SortableHeader>
              </TableHead>
              <TableHead className="min-w-[200px]">
                <SortableHeader field="summary">Summary</SortableHeader>
              </TableHead>
              <TableHead className="w-[150px]">
                <SortableHeader field="notes">Notes</SortableHeader>
              </TableHead>
              <TableHead className="w-[160px]">
                <SortableHeader field="ignoreUntil">Ignore Until</SortableHeader>
              </TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No ignored alerts found
                </TableCell>
              </TableRow>
            ) : (
              sortedAlerts.map((alert) => {
                const timeStatus = getTimeStatus(alert.ignoreUntil);
                return (
                  <TableRow
                    key={alert.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      timeStatus === 'critical' && 'table-row-critical',
                      timeStatus === 'warning' && 'table-row-warning'
                    )}
                    onClick={() => onViewAlert(alert)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={cn('status-indicator', `status-${timeStatus === 'normal' ? 'active' : timeStatus}`)} />
                        <span className="truncate">{alert.instructionGivenBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {alert.team}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {alert.system}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {alert.deviceName}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 text-sm">{alert.summary}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <p className="line-clamp-2 text-sm">{alert.notes || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className={cn(
                          'h-4 w-4',
                          timeStatus === 'critical' && 'text-destructive',
                          timeStatus === 'warning' && 'text-warning'
                        )} />
                        <Tooltip>
                          <TooltipTrigger className="text-left">
                            <span className={cn(
                              timeStatus === 'critical' && 'text-destructive font-medium',
                              timeStatus === 'warning' && 'text-warning font-medium'
                            )}>
                              {formatDistanceToNow(alert.ignoreUntil, { addSuffix: true })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(alert.ignoreUntil, 'PPpp')}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {alert.commentCount > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {alert.commentCount}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onViewAlert(alert)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(alert.status === 'active' || alert.status === 'pending') && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onEditAlert(alert)}
                              title="Edit alert"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  title="Delete alert"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Alert</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this alert? It will be moved to the archive.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDeleteAlert(alert.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
