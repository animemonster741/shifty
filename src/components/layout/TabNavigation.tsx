import { cn } from '@/lib/utils';
import { AlertTriangle, MessageSquare, BarChart3, Archive, History, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { TabNotification } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { useNavigation, NavigationTab } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// System tab keys for built-in functionality
const SYSTEM_TAB_KEYS = ['alerts', 'messages', 'statistics', 'archive', 'logs', 'links'];

export type TabId = string;

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  notifications: TabNotification;
}

export function TabNavigation({ activeTab, onTabChange, notifications }: TabNavigationProps) {
  const { t, language } = useLanguage();
  const { globalSearchQuery, resultCounts } = useGlobalSearch();
  const { tabs, isLoading, getVisibleTabs } = useNavigation();
  const { isAdmin } = useAuth();

  const getSearchResultCount = (tabKey: string): number => {
    if (!globalSearchQuery.trim()) return 0;
    if (tabKey === 'alerts') return resultCounts.alerts;
    if (tabKey === 'messages') return resultCounts.messages;
    return 0;
  };

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;
  };

  const visibleTabs = getVisibleTabs(isAdmin);

  if (isLoading) {
    return (
      <nav className="border-b border-border">
        <div className="container px-4">
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-border">
      <div className="container px-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin">
          {visibleTabs.map((tab) => {
            const hasNotification = (notifications as any)[tab.tab_key] || false;
            const isActive = activeTab === tab.tab_key;
            const searchResultCount = getSearchResultCount(tab.tab_key);
            const hasSearchResults = !isActive && globalSearchQuery.trim() && searchResultCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.tab_key)}
                className={cn(
                  'tab-glow relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200',
                  'hover:text-foreground',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground border-b-2 border-transparent',
                  (hasNotification || hasSearchResults) && !isActive && 'has-notification'
                )}
              >
                {getIconComponent(tab.icon)}
                <span className="hidden sm:inline">
                  {language === 'he' ? tab.label_he : tab.label_en}
                </span>
                {hasSearchResults && (
                  <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                    {searchResultCount > 99 ? '99+' : searchResultCount}
                  </span>
                )}
                {hasNotification && !isActive && !hasSearchResults && (
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
