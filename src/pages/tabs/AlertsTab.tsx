import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { IgnoredAlert, AlertFilters, AlertChangeLog } from '@/types';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AddAlertModal } from '@/components/alerts/AddAlertModal';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import { EditAlertModal } from '@/components/alerts/EditAlertModal';
import { FilterPanel } from '@/components/alerts/FilterPanel';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Clock, AlertTriangle, Check, X, Search as SearchIcon } from 'lucide-react';
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
  const { globalSearchQuery, filterAlerts, setAlertCount } = useGlobalSearch();
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSecondaryAddModalOpen, setIsSecondaryAddModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<IgnoredAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTableSource, setActiveTableSource] = useState<'primary' | 'secondary'>('primary');

  // Filter active alerts (only 'active' status, not pending)
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const activeSecondaryAlerts = secondaryAlerts.filter(a => a.status === 'active');
  // Pending alerts require approval
  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const pendingSecondaryAlerts = secondaryAlerts.filter(a => a.status === 'pending');
  const allPendingAlerts = [...pendingAlerts, ...pendingSecondaryAlerts];
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

  // Apply global search first, then local filters
  const globallyFilteredAlerts = useMemo(() => filterAlerts(activeAlerts), [activeAlerts, filterAlerts]);
  const globallyFilteredSecondaryAlerts = useMemo(() => filterAlerts(activeSecondaryAlerts), [activeSecondaryAlerts, filterAlerts]);

  // Apply local filters to both tables
  const filteredAlerts = useMemo(() => applyFilters(globallyFilteredAlerts), [globallyFilteredAlerts, filters]);
  const filteredSecondaryAlerts = useMemo(() => applyFilters(globallyFilteredSecondaryAlerts), [globallyFilteredSecondaryAlerts, filters]);

  // Update result counts for cross-tab notification
  useEffect(() => {
    const totalGloballyFiltered = globallyFilteredAlerts.length + globallyFilteredSecondaryAlerts.length;
    setAlertCount(totalGloballyFiltered);
  }, [globallyFilteredAlerts.length, globallyFilteredSecondaryAlerts.length, setAlertCount]);

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

  const handleApproveAlert = (alert: IgnoredAlert) => {
    const updatedAlert: IgnoredAlert = {
      ...alert,
      status: 'active',
      approvedBy: user?.employeeId,
      approvalTime: new Date(),
      modifiedBy: user?.employeeId,
      modifiedByName: user?.fullName,
      modifiedTime: new Date(),
    };

    // Determine which list the alert belongs to
    if (alerts.find(a => a.id === alert.id)) {
      onAlertsChange(alerts.map(a => a.id === alert.id ? updatedAlert : a));
    } else {
      onSecondaryAlertsChange(secondaryAlerts.map(a => a.id === alert.id ? updatedAlert : a));
    }
    toast.success(t('alerts.alertApproved'));
  };

  const handleRejectAlert = (alert: IgnoredAlert) => {
    const updatedAlert: IgnoredAlert = {
      ...alert,
      status: 'deleted',
      archivedTime: new Date(),
      archiveReason: 'Rejected by admin',
      modifiedBy: user?.employeeId,
      modifiedByName: user?.fullName,
      modifiedTime: new Date(),
    };

    // Determine which list the alert belongs to
    if (alerts.find(a => a.id === alert.id)) {
      onAlertsChange(alerts.map(a => a.id === alert.id ? updatedAlert : a));
    } else {
      onSecondaryAlertsChange(secondaryAlerts.map(a => a.id === alert.id ? updatedAlert : a));
    }
    toast.success(t('alerts.alertRejected'));
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
        {user?.role === 'admin' && allPendingAlerts.length > 0 && (
          <div className="stat-card sm:col-span-2 lg:col-span-2 !border-warning/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('alerts.pendingApproval')}</p>
                <p className="text-2xl font-bold text-warning">{allPendingAlerts.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('alerts.awaitingApproval')}
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

      {/* Pending Approvals Review Queue - Only shown to admins when there are pending alerts */}
      {user?.role === 'admin' && allPendingAlerts.length > 0 && filters.status === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-warning">{t('alerts.pendingReview')}</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
            >
              {t('filter.clearFilters')}
            </Button>
          </div>
          <div className="grid gap-4">
            {allPendingAlerts.map(alert => (
              <div 
                key={alert.id} 
                className="rounded-lg border border-warning/50 bg-warning/5 p-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{alert.summary || 'No summary'}</span>
                      <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                        {t('alerts.durationOver48h')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><span className="font-medium">{t('alerts.team')}:</span> {alert.team}</p>
                      <p><span className="font-medium">{t('alerts.system')}:</span> {alert.system}</p>
                      <p><span className="font-medium">{t('alerts.instructionGivenBy')}:</span> {alert.instructionGivenBy}</p>
                      <p><span className="font-medium">{t('alerts.addedBy')}:</span> {alert.addedByName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <X className="h-4 w-4 me-1" />
                          {t('alerts.reject')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir={direction}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('alerts.rejectConfirm')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('alerts.rejectConfirmDesc')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleRejectAlert(alert)}
                          >
                            {t('alerts.reject')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <Check className="h-4 w-4 me-1" />
                          {t('alerts.approve')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir={direction}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('alerts.approveConfirm')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('alerts.approveConfirmDesc')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveAlert(alert)}
                          >
                            {t('alerts.approve')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
        </div>
      )}

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <FilterPanel 
            filters={filters} 
            onFiltersChange={setFilters}
            showStatusFilter={false}
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 me-2" />
          {t('alerts.addAlert')}
        </Button>
      </div>

      {/* Results info */}
      {(hasActiveFilters || globalSearchQuery) && filters.status !== 'pending' && (
        <div className="text-sm text-muted-foreground">
          {t('common.showing')} {filteredAlerts.length + filteredSecondaryAlerts.length} {t('common.of')} {totalActiveAlerts} {t('alerts.activeAlerts').toLowerCase()}
        </div>
      )}

      {/* No results state */}
      {globalSearchQuery && filteredAlerts.length === 0 && filteredSecondaryAlerts.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <div className="text-muted-foreground space-y-2">
            <p className="font-medium">{t('search.noResults')}</p>
            <p className="text-sm">{t('search.noResultsDesc')}</p>
          </div>
        </div>
      )}

      {/* Primary Table */}
      {(filteredAlerts.length > 0 || !globalSearchQuery) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">{t('tabs.alerts')}</h2>
          <AlertsTable
            alerts={filteredAlerts}
            onViewAlert={(alert) => handleViewAlert(alert, 'primary')}
            onDeleteAlert={(alertId) => handleDeleteAlert(alertId, 'primary')}
          />
        </div>
      )}

      {/* Separator */}
      {(filteredAlerts.length > 0 || filteredSecondaryAlerts.length > 0 || !globalSearchQuery) && (
        <Separator className="my-8" />
      )}

      {/* Secondary Table Section */}
      {(filteredSecondaryAlerts.length > 0 || !globalSearchQuery) && (
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
      )}

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