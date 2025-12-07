import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNavigation, TabId } from '@/components/layout/TabNavigation';
import { AlertsTab } from '@/pages/tabs/AlertsTab';
import { MessagesTab } from '@/pages/tabs/MessagesTab';
import { StatisticsTab } from '@/pages/tabs/StatisticsTab';
import { ArchiveTab } from '@/pages/tabs/ArchiveTab';
import { TabNotification } from '@/types';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('alerts');
  const [notifications, setNotifications] = useState<TabNotification>({
    alerts: false,
    messages: true,
    statistics: false,
    archive: false,
  });

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setNotifications(prev => ({ ...prev, [tab]: false }));
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
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
        {activeTab === 'archive' && <ArchiveTab />}
      </main>
    </div>
  );
}
