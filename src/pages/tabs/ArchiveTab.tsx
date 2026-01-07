import { useState, useMemo } from 'react';
import { IgnoredAlert, AlertFilters } from '@/types';
import { mockArchivedAlerts, mockSecondaryArchivedAlerts } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Search, Download, Eye, Plus } from 'lucide-react';
import { format, formatDistanceToNow, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
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
  const { t, language, direction } = useLanguage();
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);
  const dateLocale = language === 'he' ? he : enUS;

  // Primary archive: combine passed alerts (deleted ones) with mock archived alerts
  const primaryArchivedAlerts = useMemo(() => {
    const deletedFromActive = alerts.filter(a => a.status === 'expired' || a.status === 'deleted');
    return [...deletedFromActive, ...mockArchivedAlerts];
  }, [alerts]);

  // Secondary archive alerts
  const secondaryArchivedAlerts = useMemo(() => {
    return [...mockSecondaryArchivedAlerts];
  }, []);

  // Apply filters to a given alerts array
  const applyFilters = (alertsArray: IgnoredAlert[]) => {
    return alertsArray.filter(alert => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          alert.summary.toLowerCase().includes(query) ||
          alert.deviceName.toLowerCase().includes(query) ||
          alert.system.toLowerCase().includes(query) ||
          alert.team.toLowerCase().includes(query) ||
          (alert.instructionGivenBy?.toLowerCase().includes(query) || false) ||
          (alert.notes?.toLowerCase().includes(query) || false) ||
          (alert.archiveReason?.toLowerCase().includes(query) || false);
        if (!matchesSearch) return false;
      }

      // Team filter
      if (filters.team && filters.team !== 'all') {
        if (alert.team !== filters.team) return false;
      }

      // System filter
      if (filters.system && filters.system !== 'all') {
        if (alert.system !== filters.system) return false;
      }

      // Status/Archive Reason filter
      if (filters.status && filters.status !== 'all') {
        if (alert.status !== filters.status) return false;
      }

      // Date range filter (using archived time)
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
  };

  // Filtered alerts for both tables
  const filteredPrimaryAlerts = useMemo(() => applyFilters(primaryArchivedAlerts), [primaryArchivedAlerts, filters]);
  const filteredSecondaryAlerts = useMemo(() => applyFilters(secondaryArchivedAlerts), [secondaryArchivedAlerts, filters]);

  const totalFiltered = filteredPrimaryAlerts.length + filteredSecondaryAlerts.length;
  const totalAll = primaryArchivedAlerts.length + secondaryArchivedAlerts.length;

  const handleExport = () => {
    const allFiltered = [...filteredPrimaryAlerts, ...filteredSecondaryAlerts];
    const headers = [t('alerts.instructionGivenBy'), t('common.reason'), t('alerts.archived'), t('alerts.summary'), t('common.device'), t('alerts.team'), t('alerts.notes')];
    const rows = allFiltered.map(alert => [
      alert.instructionGivenBy || '',
      alert.archiveReason || '',
      alert.archivedTime ? format(alert.archivedTime, 'yyyy-MM-dd HH:mm:ss') : '',
      `"${alert.summary.replace(/"/g, '""')}"`,
      alert.deviceName,
      alert.team,
      `"${(alert.notes || '').replace(/"/g, '""')}"`,
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

    toast.success(t('archive.exportedRecords').replace('{count}', String(allFiltered.length)));
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

  const getLocalizedReason = (reason?: string) => {
    switch (reason) {
      case 'Expired':
        return t('status.expired');
      case 'Deleted':
        return t('status.deleted');
      case 'Merged':
        return t('status.merged');
      default:
        return t('status.unknown');
    }
  };

  const handleAddToArchive = () => {
    toast.info(language === 'he' ? 'פונקציה זו תתווסף בקרוב' : 'This feature will be added soon');
  };

  // Reusable table component
  const ArchiveTable = ({ alerts: tableAlerts, title }: { alerts: IgnoredAlert[]; title?: string }) => (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">{t('alerts.instructionGivenBy')}</TableHead>
              <TableHead className="w-[100px]">{t('common.reason')}</TableHead>
              <TableHead className="w-[140px]">{t('alerts.archived')}</TableHead>
              <TableHead className="min-w-[200px]">{t('alerts.summary')}</TableHead>
              <TableHead className="w-[120px]">{t('common.device')}</TableHead>
              <TableHead className="w-[120px]">{t('alerts.team')}</TableHead>
              <TableHead className="w-[150px]">{t('alerts.notes')}</TableHead>
              <TableHead className="w-[80px] text-end">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {t('archive.noAlerts')}
                </TableCell>
              </TableRow>
            ) : (
              tableAlerts.map((alert) => (
                <TableRow key={alert.id} className="opacity-80 hover:opacity-100 transition-opacity">
                  <TableCell className="font-medium">
                    {alert.instructionGivenBy || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getReasonBadgeVariant(alert.archiveReason)}>
                      {getLocalizedReason(alert.archiveReason)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {alert.archivedTime && (
                      <Tooltip>
                        <TooltipTrigger className="text-start">
                          {formatDistanceToNow(alert.archivedTime, { addSuffix: true, locale: dateLocale })}
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(alert.archivedTime, 'PPpp', { locale: dateLocale })}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {alert.summary}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {alert.deviceName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {alert.team}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <p className="line-clamp-2">{alert.notes || '-'}</p>
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
  );

  return (
    <div className="space-y-6 animate-fade-in" dir={direction}>
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('filter.searchArchive')}
            className="ps-9 input-noc"
          />
        </div>
        <div className="flex gap-2 items-center">
          <FilterPanel 
            filters={filters} 
            onFiltersChange={setFilters}
            showStatusFilter={true}
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 me-2" />
            {t('common.exportCsv')}
          </Button>
        </div>
      </div>

      {/* Archive info */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="text-sm text-muted-foreground">
          {t('common.showing')} <span className="font-medium text-foreground">{totalFiltered}</span> {t('common.of')}{' '}
          <span className="font-medium text-foreground">{totalAll}</span> {t('archive.archivedRecords')}
          {' | '}{t('archive.retentionNote')}
        </div>
      </div>

      {/* Primary Archive Table */}
      <ArchiveTable alerts={filteredPrimaryAlerts} />

      {/* Secondary Archive Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('archive.secondaryArchive')}</h2>
          <Button onClick={handleAddToArchive} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 me-2" />
            {t('archive.addToArchive')}
          </Button>
        </div>
        <ArchiveTable alerts={filteredSecondaryAlerts} />
      </div>
    </div>
  );
}