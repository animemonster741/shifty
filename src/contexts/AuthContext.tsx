import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'employee' | 'manager';

export interface User {
  employeeId: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (employeeId: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - managers have IDs starting with 1
const mockUsers: Record<string, User> = {
  '1001': { employeeId: '1001', name: 'Sarah Mitchell', role: 'manager' },
  '1002': { employeeId: '1002', name: 'David Chen', role: 'manager' },
  '2001': { employeeId: '2001', name: 'Alex Thompson', role: 'employee' },
  '2002': { employeeId: '2002', name: 'Jordan Rivera', role: 'employee' },
  '2003': { employeeId: '2003', name: 'Casey Morgan', role: 'employee' },
  '2004': { employeeId: '2004', name: 'Taylor Brooks', role: 'employee' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem('noc-user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (employeeId: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user exists in mock database
    let userData = mockUsers[employeeId];

    // If not found, create a new employee user
    if (!userData) {
      userData = {
        employeeId,
        name: `Employee ${employeeId}`,
        role: employeeId.startsWith('1') ? 'manager' : 'employee',
      };
    }

    setUser(userData);
    sessionStorage.setItem('noc-user', JSON.stringify(userData));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('noc-user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
