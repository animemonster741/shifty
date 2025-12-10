import { useState, useMemo } from 'react';
import { IgnoredAlert, AlertFilters } from '@/types';
import { mockArchivedAlerts } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterPanel } from '@/components/alerts/FilterPanel';
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
import { Search, Download, Eye } from 'lucide-react';
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { toast } from 'sonner';

const defaultFilters: AlertFilters = {
  searchQuery: '',
  team: 'all',
  system: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

interface ArchiveTabProps {
  alerts: IgnoredAlert[];
  onAlertsChange: (alerts: IgnoredAlert[]) => void;
}

export function ArchiveTab({ alerts, onAlertsChange }: ArchiveTabProps) {
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);

  // Combine passed alerts (deleted ones) with mock archived alerts, filter for archived status
  const archivedAlerts = useMemo(() => {
    const deletedFromActive = alerts.filter(a => a.status === 'expired' || a.status === 'deleted');
    return [...deletedFromActive, ...mockArchivedAlerts];
  }, [alerts]);

  // Apply all filters
  const filteredAlerts = useMemo(() => {
    return archivedAlerts.filter(alert => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          alert.summary.toLowerCase().includes(query) ||
          alert.deviceName.toLowerCase().includes(query) ||
          alert.system.toLowerCase().includes(query) ||
          alert.team.toLowerCase().includes(query) ||
          alert.addedByName.toLowerCase().includes(query) ||
          (alert.archiveReason?.toLowerCase().includes(query) || false);
        if (!matchesSearch) return false;
      }

      // Team filter - exact match
      if (filters.team && filters.team !== 'all') {
        if (alert.team !== filters.team) return false;
      }

      // System filter - exact match
      if (filters.system && filters.system !== 'all') {
        if (alert.system !== filters.system) return false;
      }

      // Status/Archive Reason filter
      if (filters.status && filters.status !== 'all') {
        if (alert.status !== filters.status) return false;
      }

      // Date range filter (using archived time for archive)
      const dateToCheck = alert.archivedTime || alert.createdTime;
      
      if (filters.dateFrom) {
        const fromDate = startOfDay(parseISO(filters.dateFrom));
        if (isBefore(dateToCheck, fromDate)) return false;
      }

      if (filters.dateTo) {
        const toDate = endOfDay(parseISO(filters.dateTo));
        if (isAfter(dateToCheck, toDate)) return false;
      }

      return true;
    });
  }, [archivedAlerts, filters]);

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Added By', 'Created Time', 'Team', 'System', 'Device', 'Summary', 'Archived Time', 'Reason'];
    const rows = filteredAlerts.map(alert => [
      alert.addedByName,
      format(alert.createdTime, 'yyyy-MM-dd HH:mm:ss'),
      alert.team,
      alert.system,
      alert.deviceName,
      `"${alert.summary.replace(/"/g, '""')}"`,
      alert.archivedTime ? format(alert.archivedTime, 'yyyy-MM-dd HH:mm:ss') : '',
      alert.archiveReason || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NOC_Archive_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredAlerts.length} records to CSV`);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
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
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search archive..."
            className="pl-9 input-noc"
          />
        </div>
        <div className="flex gap-2 items-center">
          <FilterPanel 
            filters={filters} 
            onFiltersChange={setFilters}
            showStatusFilter={true}
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Archive info */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredAlerts.length}</span> of{' '}
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
                    No archived alerts found matching your filters
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
