import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { IgnoredAlert, AlertFilters, AlertChangeLog } from '@/types';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AddAlertModal } from '@/components/alerts/AddAlertModal';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import { EditAlertModal } from '@/components/alerts/EditAlertModal';
import { FilterPanel } from '@/components/alerts/FilterPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Clock, AlertTriangle } from 'lucide-react';
import { differenceInHours, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import { toast } from 'sonner';

const defaultFilters: AlertFilters = {
  searchQuery: '',
  team: 'all',
  system: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

interface AlertsTabProps {
  alerts: IgnoredAlert[];
  secondaryAlerts: IgnoredAlert[];
  onAlertsChange: (alerts: IgnoredAlert[]) => void;
  onSecondaryAlertsChange: (alerts: IgnoredAlert[]) => void;
}

export function AlertsTab({ alerts, secondaryAlerts, onAlertsChange, onSecondaryAlertsChange }: AlertsTabProps) {
  const { user } = useAuth();
  const { t, direction } = useLanguage();
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSecondaryAddModalOpen, setIsSecondaryAddModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<IgnoredAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTableSource, setActiveTableSource] = useState<'primary' | 'secondary'>('primary');

  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'pending');
  const activeSecondaryAlerts = secondaryAlerts.filter(a => a.status === 'active' || a.status === 'pending');
  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const expiringSoon = activeAlerts.filter(a => {
    const hours = differenceInHours(a.ignoreUntil, new Date());
    return hours < 6 && hours >= 0;
  });

  // Filter function that applies to any alert array
  const applyFilters = (alertsToFilter: IgnoredAlert[]) => {
    return alertsToFilter.filter(alert => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          alert.summary.toLowerCase().includes(query) ||
          alert.deviceName.toLowerCase().includes(query) ||
          alert.system.toLowerCase().includes(query) ||
          alert.team.toLowerCase().includes(query) ||
          alert.addedByName.toLowerCase().includes(query) ||
          alert.instructionGivenBy.toLowerCase().includes(query);
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

      // Status filter (for active alerts, only active and pending make sense)
      if (filters.status && filters.status !== 'all') {
        if (alert.status !== filters.status) return false;
      }

      // Date range filter - based on createdTime
      if (filters.dateFrom) {
        const fromDate = startOfDay(parseISO(filters.dateFrom));
        if (isBefore(alert.createdTime, fromDate)) return false;
      }

      if (filters.dateTo) {
        const toDate = endOfDay(parseISO(filters.dateTo));
        if (isAfter(alert.createdTime, toDate)) return false;
      }

      return true;
    });
  };

  // Apply filters to both tables
  const filteredAlerts = useMemo(() => applyFilters(activeAlerts), [activeAlerts, filters]);
  const filteredSecondaryAlerts = useMemo(() => applyFilters(activeSecondaryAlerts), [activeSecondaryAlerts, filters]);

  const handleAddAlert = (data: any) => {
    const newAlert: IgnoredAlert = {
      id: `alert-${Date.now()}`,
      ...data,
      commentCount: 0,
      changeLogs: [],
    };
    onAlertsChange([newAlert, ...alerts]);
  };

  const handleAddSecondaryAlert = (data: any) => {
    const newAlert: IgnoredAlert = {
      id: `sec-alert-${Date.now()}`,
      ...data,
      commentCount: 0,
      changeLogs: [],
    };
    onSecondaryAlertsChange([newAlert, ...secondaryAlerts]);
  };

  const handleViewAlert = (alert: IgnoredAlert, source: 'primary' | 'secondary') => {
    setSelectedAlert(alert);
    setActiveTableSource(source);
    setIsDetailModalOpen(true);
  };

  const handleEditAlert = (alert: IgnoredAlert) => {
    setSelectedAlert(alert);
    setIsEditModalOpen(true);
  };

  const handleUpdateAlert = (updatedAlert: IgnoredAlert, changeLogs: AlertChangeLog[]) => {
    if (activeTableSource === 'primary') {
      onAlertsChange(alerts.map(a => a.id === updatedAlert.id ? updatedAlert : a));
    } else {
      onSecondaryAlertsChange(secondaryAlerts.map(a => a.id === updatedAlert.id ? updatedAlert : a));
    }
  };

  const handleDeleteAlert = (alertId: string, source: 'primary' | 'secondary') => {
    const alertsSource = source === 'primary' ? alerts : secondaryAlerts;
    const onChangeHandler = source === 'primary' ? onAlertsChange : onSecondaryAlertsChange;
    const alertToDelete = alertsSource.find(a => a.id === alertId);
    
    if (!alertToDelete) return;

    // Only active/pending alerts can be deleted (archived via status change)
    if (alertToDelete.status !== 'active' && alertToDelete.status !== 'pending') {
      toast.error('Only active alerts can be deleted');
      return;
    }

    const updatedAlert: IgnoredAlert = {
      ...alertToDelete,
      status: 'deleted',
      archivedTime: new Date(),
      archiveReason: 'Deleted',
      modifiedBy: user?.employeeId,
      modifiedByName: user?.fullName,
      modifiedTime: new Date(),
    };

    onChangeHandler(alertsSource.map(a => a.id === alertId ? updatedAlert : a));
    toast.success('Alert deleted and moved to archive');
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  const totalActiveAlerts = activeAlerts.length + activeSecondaryAlerts.length;
  const hasActiveFilters = filters.team !== 'all' || filters.system !== 'all' || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-6 animate-fade-in" dir={direction}>
      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('alerts.activeAlerts')}</p>
              <p className="text-2xl font-bold">{totalActiveAlerts}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('alerts.expiringSoon')}</p>
              <p className="text-2xl font-bold text-warning">{expiringSoon.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </div>
        </div>
        {user?.role === 'admin' && pendingAlerts.length > 0 && (
          <div className="stat-card sm:col-span-2 lg:col-span-2 !border-warning/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('alerts.pendingApproval')}</p>
                <p className="text-2xl font-bold text-warning">{pendingAlerts.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Exception ignores awaiting your approval
                </p>
              </div>
              <Button 
                variant="warning" 
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium"
                onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
              >
                {t('alerts.reviewNow')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('filter.searchPlaceholder')}
            className="ps-9 input-noc"
          />
        </div>
        <div className="flex gap-2 items-center">
          <FilterPanel 
            filters={filters} 
            onFiltersChange={setFilters}
            showStatusFilter={false}
          />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t('alerts.addAlert')}
          </Button>
        </div>
      </div>

      {/* Results info */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {t('common.showing')} {filteredAlerts.length + filteredSecondaryAlerts.length} {t('common.of')} {totalActiveAlerts} {t('alerts.activeAlerts').toLowerCase()}
        </div>
      )}

      {/* Primary Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">{t('tabs.alerts')}</h2>
        <AlertsTable
          alerts={filteredAlerts}
          onViewAlert={(alert) => handleViewAlert(alert, 'primary')}
          onDeleteAlert={(alertId) => handleDeleteAlert(alertId, 'primary')}
        />
      </div>

      {/* Separator */}
      <Separator className="my-8" />

      {/* Secondary Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('alerts.additionalAlerts')}</h2>
          <Button onClick={() => setIsSecondaryAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t('alerts.addNewAlert')}
          </Button>
        </div>
        <AlertsTable
          alerts={filteredSecondaryAlerts}
          onViewAlert={(alert) => handleViewAlert(alert, 'secondary')}
          onDeleteAlert={(alertId) => handleDeleteAlert(alertId, 'secondary')}
        />
      </div>

      {/* Modals */}
      <AddAlertModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddAlert}
      />
      <AddAlertModal
        open={isSecondaryAddModalOpen}
        onOpenChange={setIsSecondaryAddModalOpen}
        onSubmit={handleAddSecondaryAlert}
      />
      <AlertDetailModal
        alert={selectedAlert}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onEditAlert={handleEditAlert}
      />
      <EditAlertModal
        alert={selectedAlert}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateAlert}
      />
    </div>
  );
}