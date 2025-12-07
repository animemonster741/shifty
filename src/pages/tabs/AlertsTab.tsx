import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { IgnoredAlert } from '@/types';
import { mockAlerts } from '@/data/mockData';
import { AlertsTable } from '@/components/alerts/AlertsTable';
import { AddAlertModal } from '@/components/alerts/AddAlertModal';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Clock, AlertTriangle } from 'lucide-react';
import { differenceInHours } from 'date-fns';

export function AlertsTab() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<IgnoredAlert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<IgnoredAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'pending');
  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const expiringSoon = activeAlerts.filter(a => {
    const hours = differenceInHours(a.ignoreUntil, new Date());
    return hours < 6 && hours >= 0;
  });

  const filteredAlerts = activeAlerts.filter(alert =>
    alert.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAlert = (data: any) => {
    const newAlert: IgnoredAlert = {
      id: `alert-${Date.now()}`,
      ...data,
      commentCount: 0,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleViewAlert = (alert: IgnoredAlert) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  };

  const handleEditAlert = (alert: IgnoredAlert) => {
    // For now, just open the detail modal
    handleViewAlert(alert);
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts..."
            className="pl-9 input-noc"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ignore
          </Button>
        </div>
      </div>

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
    </div>
  );
}
