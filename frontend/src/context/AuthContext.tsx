import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStats } from '../types';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  stats: UserStats | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  switchDemoRole: (role: 'student' | 'faculty' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setStats(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.getProfile();
      if (data.success) {
        setUser(data.user);
        setStats(data.stats);
      } else {
        clearAuthToken();
        setUser(null);
        setStats(null);
      }
    } catch {
      clearAuthToken();
      setUser(null);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (identifier: string, password = 'jntua@123') => {
    setIsLoading(true);
    try {
      const res = await api.login({ identifier, password });
      if (res.success && res.token) {
        setAuthToken(res.token);
        setUser(res.user);
        await refreshProfile();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setStats(null);
  };

  const switchDemoRole = async (role: 'student' | 'faculty' | 'admin') => {
    const identifiers: Record<string, string> = {
      student: '21001A0501',
      faculty: 'JNTUA-FAC-101',
      admin: 'LIBRARIAN-01'
    };
    await login(identifiers[role], 'jntua@123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        isLoading,
        login,
        logout,
        refreshProfile,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
