import { cn } from '@/lib/utils';
import { AlertTriangle, MessageSquare, BarChart3, Archive } from 'lucide-react';
import { TabNotification } from '@/types';

type TabId = 'alerts' | 'messages' | 'statistics' | 'archive';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'alerts', label: 'Ignored Alerts', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'messages', label: 'Important Messages', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'archive', label: 'Archive', icon: <Archive className="h-4 w-4" /> },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  notifications: TabNotification;
}

export function TabNavigation({ activeTab, onTabChange, notifications }: TabNavigationProps) {
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
                <span className="hidden sm:inline">{tab.label}</span>
                {hasNotification && !isActive && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
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
