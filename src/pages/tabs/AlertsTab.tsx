import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IgnoredAlert, AlertFilters, AlertChangeLog } from '@/types';
import { mockAlerts } from '@/data/mockData';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AddAlertModal } from '@/components/alerts/AddAlertModal';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import { EditAlertModal } from '@/components/alerts/EditAlertModal';
import { FilterPanel } from '@/components/alerts/FilterPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Clock, AlertTriangle } from 'lucide-react';
import { differenceInHours, isAfter, isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';

const defaultFilters: AlertFilters = {
  searchQuery: '',
  team: 'all',
  system: 'all',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export function AlertsTab() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<IgnoredAlert[]>(mockAlerts);
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<IgnoredAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'pending');
  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const expiringSoon = activeAlerts.filter(a => {
    const hours = differenceInHours(a.ignoreUntil, new Date());
    return hours < 6 && hours >= 0;
  });

  // Apply all filters
  const filteredAlerts = useMemo(() => {
    return activeAlerts.filter(alert => {
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

      // Team filter
      if (filters.team && filters.team !== 'all') {
        if (alert.team !== filters.team) return false;
      }

      // System filter
      if (filters.system && filters.system !== 'all') {
        if (alert.system !== filters.system) return false;
      }

      // Status filter (for active alerts, only active and pending make sense)
      if (filters.status && filters.status !== 'all') {
        if (alert.status !== filters.status) return false;
      }

      // Date range filter
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
  }, [activeAlerts, filters]);

  const handleAddAlert = (data: any) => {
    const newAlert: IgnoredAlert = {
      id: `alert-${Date.now()}`,
      ...data,
      commentCount: 0,
      changeLogs: [],
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleViewAlert = (alert: IgnoredAlert) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  };

  const handleEditAlert = (alert: IgnoredAlert) => {
    setSelectedAlert(alert);
    setIsEditModalOpen(true);
  };

  const handleUpdateAlert = (updatedAlert: IgnoredAlert, changeLogs: AlertChangeLog[]) => {
    setAlerts(prev => prev.map(a => 
      a.id === updatedAlert.id ? updatedAlert : a
    ));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Ignores</p>
              <p className="text-2xl font-bold">{activeAlerts.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold text-warning">{expiringSoon.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
          </div>
        </div>
        {user?.role === 'manager' && pendingAlerts.length > 0 && (
          <div className="stat-card sm:col-span-2 lg:col-span-2 !border-warning/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-warning">{pendingAlerts.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Exception ignores awaiting your approval
                </p>
              </div>
              <Button variant="warning" size="sm">
                Review Now
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search alerts..."
            className="pl-9 input-noc"
          />
        </div>
        <div className="flex gap-2 items-center">
          <FilterPanel 
            filters={filters} 
            onFiltersChange={setFilters}
            showStatusFilter={false}
          />
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ignore
          </Button>
        </div>
      </div>

      {/* Results info */}
      {(filters.team !== 'all' || filters.system !== 'all' || filters.dateFrom || filters.dateTo) && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAlerts.length} of {activeAlerts.length} active alerts
        </div>
      )}

      {/* Table */}
      <AlertsTable
        alerts={filteredAlerts}
        onViewAlert={handleViewAlert}
        onEditAlert={handleEditAlert}
      />

      {/* Modals */}
      <AddAlertModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddAlert}
      />
      <AlertDetailModal
        alert={selectedAlert}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
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
