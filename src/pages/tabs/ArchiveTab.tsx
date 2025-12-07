import { useState } from 'react';
import { IgnoredAlert } from '@/types';
import { mockArchivedAlerts } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Download, Filter, Eye } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function ArchiveTab() {
  const [archivedAlerts] = useState<IgnoredAlert[]>(mockArchivedAlerts);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = archivedAlerts.filter(alert =>
    alert.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    toast.success('Archive exported to CSV');
  };

  const getReasonBadgeVariant = (reason?: string) => {
    switch (reason) {
      case 'Expired':
        return 'expired';
      case 'Deleted':
        return 'destructive';
      case 'Merged':
        return 'secondary';
      default:
        return 'outline';
    }
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
            placeholder="Search archive..."
            className="pl-9 input-noc"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Archive info */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{archivedAlerts.length}</span> archived records
          | Data retained for compliance and audit purposes
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">Added By</TableHead>
                <TableHead className="w-[140px]">Created</TableHead>
                <TableHead className="w-[120px]">Team</TableHead>
                <TableHead className="w-[120px]">Device</TableHead>
                <TableHead className="min-w-[200px]">Summary</TableHead>
                <TableHead className="w-[140px]">Archived</TableHead>
                <TableHead className="w-[100px]">Reason</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No archived alerts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id} className="opacity-80">
                    <TableCell className="font-medium">
                      {alert.addedByName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger className="text-left">
                          {formatDistanceToNow(alert.createdTime, { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(alert.createdTime, 'PPpp')}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {alert.team}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {alert.deviceName}
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {alert.summary}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {alert.archivedTime && (
                        <Tooltip>
                          <TooltipTrigger className="text-left">
                            {formatDistanceToNow(alert.archivedTime, { addSuffix: true })}
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(alert.archivedTime, 'PPpp')}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getReasonBadgeVariant(alert.archiveReason)}>
                        {alert.archiveReason || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
