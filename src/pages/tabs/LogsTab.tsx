import { useState, useMemo } from 'react';
import { AlertChangeLog } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, History, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface LogsTabProps {
  logs: AlertChangeLog[];
}

type SortField = 'changedByName' | 'changedAt' | 'fieldName' | 'alertId';
type SortDirection = 'asc' | 'desc';

export function LogsTab({ logs }: LogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fieldFilter, setFieldFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('changedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get unique field names for filter
  const fieldNames = useMemo(() => {
    const fields = new Set(logs.map(log => log.fieldName));
    return Array.from(fields).sort();
  }, [logs]);

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    let result = logs.filter(log => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          log.changedByName.toLowerCase().includes(query) ||
          log.fieldName.toLowerCase().includes(query) ||
          log.oldValue.toLowerCase().includes(query) ||
          log.newValue.toLowerCase().includes(query) ||
          log.alertId.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Field filter
      if (fieldFilter && fieldFilter !== 'all') {
        if (log.fieldName !== fieldFilter) return false;
      }

      // Date range filter
      if (dateFrom) {
        const fromDate = startOfDay(parseISO(dateFrom));
        if (isBefore(log.changedAt, fromDate)) return false;
      }

      if (dateTo) {
        const toDate = endOfDay(parseISO(dateTo));
        if (isAfter(log.changedAt, toDate)) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
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

    return result;
  }, [logs, searchQuery, fieldFilter, dateFrom, dateTo, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const headers = ['Changed By', 'Changed At', 'Alert ID', 'Field', 'Old Value', 'New Value'];
    const rows = filteredLogs.map(log => [
      log.changedByName,
      format(log.changedAt, 'yyyy-MM-dd HH:mm:ss'),
      log.alertId,
      log.fieldName,
      `"${log.oldValue.replace(/"/g, '""')}"`,
      `"${log.newValue.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NOC_Logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredLogs.length} log entries to CSV`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFieldFilter('all');
    setDateFrom('');
    setDateTo('');
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

  const hasActiveFilters = searchQuery || fieldFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Change Logs</h2>
          <p className="text-sm text-muted-foreground">
            Track all modifications made to alerts for auditing purposes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-9 w-[200px] input-noc"
            />
          </div>
          
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="w-[160px] input-noc">
              <SelectValue placeholder="All Fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              {fieldNames.map(field => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="From"
            className="w-[140px] input-noc"
          />
          
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="To"
            className="w-[140px] input-noc"
          />

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredLogs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Results info */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredLogs.length}</span> of{' '}
          <span className="font-medium text-foreground">{logs.length}</span> log entries
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[140px]">
                  <SortableHeader field="changedByName">Changed By</SortableHeader>
                </TableHead>
                <TableHead className="w-[160px]">
                  <SortableHeader field="changedAt">Changed At</SortableHeader>
                </TableHead>
                <TableHead className="w-[120px]">
                  <SortableHeader field="alertId">Alert ID</SortableHeader>
                </TableHead>
                <TableHead className="w-[140px]">
                  <SortableHeader field="fieldName">Field</SortableHeader>
                </TableHead>
                <TableHead className="min-w-[200px]">Old Value</TableHead>
                <TableHead className="min-w-[200px]">New Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {logs.length === 0 
                      ? 'No change logs recorded yet'
                      : 'No log entries match your filters'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.changedByName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger className="text-left">
                          {formatDistanceToNow(log.changedAt, { addSuffix: true })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(log.changedAt, 'PPpp')}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.alertId.substring(0, 8)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {log.fieldName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {log.oldValue || '(empty)'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2">
                        {log.newValue || '(empty)'}
                      </p>
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
