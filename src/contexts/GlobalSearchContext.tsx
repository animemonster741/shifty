import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { IgnoredAlert, ImportantMessage } from '@/types';

interface SearchResultCounts {
  alerts: number;
  messages: number;
}

interface GlobalSearchContextType {
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  resultCounts: SearchResultCounts;
  setAlertCount: (count: number) => void;
  setMessageCount: (count: number) => void;
  filterAlerts: (alerts: IgnoredAlert[]) => IgnoredAlert[];
  filterMessages: (messages: ImportantMessage[]) => ImportantMessage[];
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

interface GlobalSearchProviderProps {
  children: ReactNode;
}

export function GlobalSearchProvider({ children }: GlobalSearchProviderProps) {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [resultCounts, setResultCounts] = useState<SearchResultCounts>({ alerts: 0, messages: 0 });

  const setAlertCount = (count: number) => {
    setResultCounts(prev => ({ ...prev, alerts: count }));
  };

  const setMessageCount = (count: number) => {
    setResultCounts(prev => ({ ...prev, messages: count }));
  };

  const filterAlerts = useMemo(() => {
    return (alerts: IgnoredAlert[]): IgnoredAlert[] => {
      if (!globalSearchQuery.trim()) return alerts;
      
      const query = globalSearchQuery.toLowerCase();
      return alerts.filter(alert => 
        alert.instructionGivenBy.toLowerCase().includes(query) ||
        alert.system.toLowerCase().includes(query) ||
        alert.deviceName.toLowerCase().includes(query) ||
        alert.summary.toLowerCase().includes(query) ||
        (alert.notes?.toLowerCase().includes(query) ?? false)
      );
    };
  }, [globalSearchQuery]);

  const filterMessages = useMemo(() => {
    return (messages: ImportantMessage[]): ImportantMessage[] => {
      if (!globalSearchQuery.trim()) return messages;
      
      const query = globalSearchQuery.toLowerCase();
      return messages.filter(message =>
        message.title.toLowerCase().includes(query) ||
        message.content.toLowerCase().includes(query)
      );
    };
  }, [globalSearchQuery]);

  const value = {
    globalSearchQuery,
    setGlobalSearchQuery,
    resultCounts,
    setAlertCount,
    setMessageCount,
    filterAlerts,
    filterMessages,
  };

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (context === undefined) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
  }
  return context;
}
