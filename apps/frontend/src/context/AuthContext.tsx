import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@infrasphere/shared-types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoUser: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
  canManageAssets: boolean;
  canInspect: boolean;
  canMaintain: boolean;
  canAudit: boolean;
  isReadOnly: boolean;
  roleDescription: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('infrasphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('infrasphere_token'));

  const role = user?.role || 'VIEWER';
  const canManageAssets = role === 'ADMIN' || role === 'ASSET_MANAGER';
  const canInspect = role === 'ADMIN' || role === 'INSPECTOR';
  const canMaintain = role === 'ADMIN' || role === 'MAINTENANCE_MANAGER';
  const canAudit = role === 'ADMIN';
  const isReadOnly = role === 'VIEWER';

  let roleDescription = 'Observer (Read-Only)';
  if (role === 'ADMIN') roleDescription = 'Full Administrator Control';
  else if (role === 'ASSET_MANAGER') roleDescription = 'Asset Lifecycle & Registry Lead';
  else if (role === 'INSPECTOR') roleDescription = 'Quality & Defect Auditor';
  else if (role === 'MAINTENANCE_MANAGER') roleDescription = 'Work Orders & Repairs Lead';

  const login = async (email: string, password: string = 'Infrasphere@2026') => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success && res.data.data) {
        const { accessToken, user: userData } = res.data.data;
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem('infrasphere_token', accessToken);
        localStorage.setItem('infrasphere_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('infrasphere_token');
    localStorage.removeItem('infrasphere_user');
  };

  const switchDemoUser = async (email: string) => {
    return login(email, 'Infrasphere@2026');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        switchDemoUser,
        isAuthenticated: Boolean(user && token),
        canManageAssets,
        canInspect,
        canMaintain,
        canAudit,
        isReadOnly,
        roleDescription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
