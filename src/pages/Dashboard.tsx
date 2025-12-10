import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNavigation, TabId } from '@/components/layout/TabNavigation';
import { AlertsTab } from '@/pages/tabs/AlertsTab';
import { MessagesTab } from '@/pages/tabs/MessagesTab';
import { StatisticsTab } from '@/pages/tabs/StatisticsTab';
import { ArchiveTab } from '@/pages/tabs/ArchiveTab';
import { LogsTab } from '@/pages/tabs/LogsTab';
import { TabNotification, AlertChangeLog, IgnoredAlert } from '@/types';
import { mockAlerts } from '@/data/mockData';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('alerts');
  const [notifications, setNotifications] = useState<TabNotification>({
    alerts: false,
    messages: true,
    statistics: false,
    archive: false,
    logs: false,
  });
  const [alerts, setAlerts] = useState<IgnoredAlert[]>(mockAlerts);

  // Collect all logs from all alerts
  const allLogs: AlertChangeLog[] = alerts
    .flatMap(alert => alert.changeLogs || [])
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setNotifications(prev => ({ ...prev, [tab]: false }));
  };

  const handleAlertsChange = (newAlerts: IgnoredAlert[]) => {
    setAlerts(newAlerts);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notifications={notifications}
      />
      <main className="container px-4 py-6">
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} onAlertsChange={handleAlertsChange} />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
        {activeTab === 'archive' && <ArchiveTab alerts={alerts} onAlertsChange={handleAlertsChange} />}
        {activeTab === 'logs' && <LogsTab logs={allLogs} />}
      </main>
    </div>
  );
}
