import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNavigation, TabId } from '@/components/layout/TabNavigation';
import { AlertsTab } from '@/pages/tabs/AlertsTab';
import { MessagesTab } from '@/pages/tabs/MessagesTab';
import { StatisticsTab } from '@/pages/tabs/StatisticsTab';
import { ArchiveTab } from '@/pages/tabs/ArchiveTab';
import { LogsTab } from '@/pages/tabs/LogsTab';
import { LinksTab } from '@/pages/tabs/LinksTab';
import { KnowledgeBaseTab } from '@/pages/tabs/KnowledgeBaseTab';
import { RoomAccessTab } from '@/pages/tabs/RoomAccessTab';
import { CustomPageTab } from '@/pages/tabs/CustomPageTab';
import { TabNotification, AlertChangeLog, IgnoredAlert } from '@/types';
import { mockAlerts, mockSecondaryAlerts } from '@/data/mockData';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { direction } = useLanguage();
  const { tabs, isLoading, getVisibleTabs } = useNavigation();
  const { isAdmin } = useAuth();
  
  // Memoize visible tabs to prevent unnecessary re-renders
  const visibleTabs = useMemo(() => getVisibleTabs(isAdmin), [tabs, isAdmin, getVisibleTabs]);
  
  // Get initial tab key from first visible tab
  const initialTabKey = useMemo(() => {
    return visibleTabs.length > 0 ? visibleTabs[0].tab_key : 'alerts';
  }, []);  // Only compute once on mount
  
  const [activeTab, setActiveTab] = useState<TabId>(initialTabKey);

  // Update active tab when tabs load or change, if current tab is not visible
  useEffect(() => {
    if (!isLoading && visibleTabs.length > 0) {
      const isCurrentTabVisible = visibleTabs.some(t => t.tab_key === activeTab);
      if (!isCurrentTabVisible) {
        setActiveTab(visibleTabs[0].tab_key);
      }
    }
  }, [tabs, isLoading, isAdmin]);
  const [notifications, setNotifications] = useState<TabNotification>({
    alerts: false,
    messages: true,
    statistics: false,
    archive: false,
    logs: false,
    links: false,
  });
  const [alerts, setAlerts] = useState<IgnoredAlert[]>(mockAlerts);
  const [secondaryAlerts, setSecondaryAlerts] = useState<IgnoredAlert[]>(mockSecondaryAlerts);

  // Auto-archive expired alerts
  const archiveExpiredAlerts = useCallback(() => {
    const now = new Date();
    const archiveIfExpired = (alert: IgnoredAlert): IgnoredAlert => {
      if (
        (alert.status === 'active' || alert.status === 'pending') &&
        alert.ignoreUntil &&
        new Date(alert.ignoreUntil) < now
      ) {
        return {
          ...alert,
          status: 'expired' as const,
          archivedTime: now,
          archiveReason: 'Auto-archived: Expired',
        };
      }
      return alert;
    };

    setAlerts(currentAlerts => currentAlerts.map(archiveIfExpired));
    setSecondaryAlerts(currentAlerts => currentAlerts.map(archiveIfExpired));
  }, []);

  // Run on mount and every minute
  useEffect(() => {
    archiveExpiredAlerts();
    const interval = setInterval(archiveExpiredAlerts, 60000);
    return () => clearInterval(interval);
  }, [archiveExpiredAlerts]);

  // Collect all logs from all alerts (both primary and secondary)
  const allLogs: AlertChangeLog[] = [...alerts, ...secondaryAlerts]
    .flatMap(alert => alert.changeLogs || [])
    .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setNotifications(prev => ({ ...prev, [tab]: false }));
  };

  const handleAlertsChange = (newAlerts: IgnoredAlert[]) => {
    setAlerts(newAlerts);
  };

  const handleSecondaryAlertsChange = (newAlerts: IgnoredAlert[]) => {
    setSecondaryAlerts(newAlerts);
  };

  // Combine alerts for archive tab
  const allAlerts = [...alerts, ...secondaryAlerts];

  // Find the active tab to determine if it's a custom page
  const activeTabData = visibleTabs.find(t => t.tab_key === activeTab);
  const isCustomPage = activeTabData?.is_custom_page && activeTabData?.id;

  // Render tab content based on tab_key
  const renderTabContent = () => {
    // Handle custom pages
    if (isCustomPage && activeTabData?.id) {
      return <CustomPageTab tabId={activeTabData.id} />;
    }

    // Handle system tabs
    switch (activeTab) {
      case 'alerts':
        return (
          <AlertsTab 
            alerts={alerts} 
            secondaryAlerts={secondaryAlerts}
            onAlertsChange={handleAlertsChange} 
            onSecondaryAlertsChange={handleSecondaryAlertsChange}
          />
        );
      case 'messages':
        return <MessagesTab />;
      case 'links':
        return <LinksTab />;
      case 'knowledge-base':
        return <KnowledgeBaseTab />;
      case 'room-access':
        return <RoomAccessTab />;
      case 'statistics':
        return <StatisticsTab />;
      case 'archive':
        return <ArchiveTab alerts={allAlerts} onAlertsChange={handleAlertsChange} />;
      case 'logs':
        return <LogsTab logs={allLogs} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <Header />
      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        notifications={notifications}
      />
      <main className="container px-4 py-6">
        {renderTabContent()}
      </main>
    </div>
  );
}
