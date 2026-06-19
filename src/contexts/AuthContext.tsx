import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  employeeId: string;
  fullName: string;
  role: UserRole;
  isAccessOnly: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAccessOnly: boolean;
  login: (employeeId: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<AppUser | null> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      return {
        id: userId,
        employeeId: profile.employee_id,
        fullName: profile.full_name,
        role: (roleData?.role as UserRole) || 'user',
        isAccessOnly: profile.is_access_only ?? false,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id).then(setUser);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user.id).then((profile) => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (employeeId: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Call edge function to get the internal email for this employee ID
      const { data, error: fnError } = await supabase.functions.invoke('auth-with-employee-id', {
        body: { employeeId, password, action: 'login' },
      });

      // The edge function returns 401 with {error: "Invalid credentials"} for bad logins.
      // supabase.functions.invoke surfaces non-2xx as fnError, but data still contains the JSON body.
      if (data?.error) {
        return { error: data.error === 'Invalid credentials'
          ? 'Invalid Employee ID or password.'
          : data.error };
      }

      if (fnError) {
        console.error('Edge function error:', fnError);
        return { error: 'Login failed. Please try again.' };
      }

      if (!data?.email) {
        return { error: 'Could not retrieve user account. Please contact your administrator.' };
      }

      // Sign in with the email and password
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid Employee ID or password.' };
        }
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Login error:', err);
      return { error: 'Login failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      setUser(profile);
    }
  }, [session]);

  const value = {
    user,
    session,
    isAuthenticated: !!session && !!user,
    isLoading,
    isAdmin: user?.role === 'admin',
    isAccessOnly: user?.isAccessOnly ?? false,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
