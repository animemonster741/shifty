import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NavigationTab {
  id: string;
  tab_key: string;
  label_he: string;
  label_en: string;
  icon: string;
  display_order: number;
  is_visible: boolean;
  is_system: boolean;
  is_custom_page: boolean;
}

interface NavigationContextType {
  tabs: NavigationTab[];
  isLoading: boolean;
  refreshTabs: () => Promise<void>;
  getVisibleTabs: (isAdmin: boolean) => NavigationTab[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<NavigationTab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchTabs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_tabs')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTabs(data || []);
    } catch (error) {
      console.error('Error fetching navigation tabs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTabs();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('navigation_tabs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'navigation_tabs' },
        () => {
          fetchTabs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTabs]);

  const refreshTabs = async () => {
    await fetchTabs();
  };

  const getVisibleTabs = useCallback((isAdminUser: boolean): NavigationTab[] => {
    // Admins see all tabs, regular users see only visible tabs
    return tabs.filter(tab => isAdminUser || tab.is_visible);
  }, [tabs]);

  return (
    <NavigationContext.Provider value={{ tabs, isLoading, refreshTabs, getVisibleTabs }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
