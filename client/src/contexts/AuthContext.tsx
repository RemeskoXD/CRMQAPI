import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  root: ['*'],
  admin: ['*'],
  team_leader: ['dashboard:read', 'clients:read', 'clients:write', 'projects:read', 'projects:write', 'tasks:read', 'tasks:write', 'tasks:approve', 'calendar:read', 'calendar:write', 'invoices:read', 'inventory:read', 'users:read'],
  sales_rep: ['dashboard:read', 'clients:read', 'clients:write', 'projects:read', 'projects:write', 'tasks:read', 'tasks:write', 'calendar:read', 'calendar:write', 'invoices:read', 'invoices:create'],
  technician: ['dashboard:read', 'tasks:read', 'tasks:update_own', 'projects:read_assigned', 'calendar:read_own'],
  analyst: ['dashboard:read', 'clients:read', 'projects:read', 'tasks:read', 'invoices:read', 'reports:read', 'reports:export', 'inventory:read'],
  infoline: ['dashboard:read', 'clients:read', 'clients:write', 'projects:create', 'tasks:read', 'tasks:write', 'calendar:read'],
  accountant: ['dashboard:read', 'invoices:read', 'invoices:write', 'invoices:export', 'clients:read', 'projects:read'],
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('crmq_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crmq_token');
    if (token && !user) {
      authApi.me()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('crmq_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('crmq_token');
          localStorage.removeItem('crmq_user');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('crmq_token', res.data.token);
    localStorage.setItem('crmq_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('crmq_token');
    localStorage.removeItem('crmq_user');
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role] || [];
    return perms.includes('*') || perms.includes(permission);
  }, [user]);

  const hasRole = useCallback((...roles: string[]): boolean => {
    if (!user) return false;
    return user.role === 'root' || roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
