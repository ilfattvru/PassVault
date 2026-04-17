import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useVaultCrypto } from '@/entities/encryption-key/model/VaultCryptoContext';
import { apiFetch } from '@/shared/api/http';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  canManageAccess: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshPermissions: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canManageAccess, setCanManageAccess] = useState(false);
  const { lockVault } = useVaultCrypto();

  const refreshPermissions = useCallback(async () => {
    try {
      const response = await apiFetch('/management/assignable-roles');
      setCanManageAccess(response.status === 200);
    } catch {
      setCanManageAccess(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await apiFetch('/auth/check');
      if (response.status === 200) {
        setIsAuthenticated(true);
        await refreshPermissions();
      } else {
        setIsAuthenticated(false);
        setCanManageAccess(false);
      }
    } catch {
      setIsAuthenticated(false);
      setCanManageAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, [refreshPermissions]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async () => {
    setIsAuthenticated(true);
    await refreshPermissions();
  }, [refreshPermissions]);

  const logout = useCallback(() => {
    lockVault();
    setIsAuthenticated(false);
    setCanManageAccess(false);
  }, [lockVault]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      canManageAccess,
      login,
      logout,
      refreshPermissions,
    }),
    [isAuthenticated, isLoading, canManageAccess, login, logout, refreshPermissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
