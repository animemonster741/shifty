import { cn } from '@/lib/utils';
import { AlertTriangle, MessageSquare, BarChart3, Archive, History } from 'lucide-react';
import { TabNotification } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

type TabId = 'alerts' | 'messages' | 'statistics' | 'archive' | 'logs';

interface Tab {
  id: TabId;
  labelKey: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'alerts', labelKey: 'tabs.alerts', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'messages', labelKey: 'tabs.messages', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'statistics', labelKey: 'tabs.statistics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'archive', labelKey: 'tabs.archive', icon: <Archive className="h-4 w-4" /> },
  { id: 'logs', labelKey: 'tabs.logs', icon: <History className="h-4 w-4" /> },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  notifications: TabNotification;
}

export function TabNavigation({ activeTab, onTabChange, notifications }: TabNavigationProps) {
  const { t } = useLanguage();

  return (
    <nav className="border-b border-border">
      <div className="container px-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const hasNotification = notifications[tab.id];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'tab-glow relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200',
                  'hover:text-foreground',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground border-b-2 border-transparent',
                  hasNotification && !isActive && 'has-notification'
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                {hasNotification && !isActive && (
                  <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export type { TabId };
