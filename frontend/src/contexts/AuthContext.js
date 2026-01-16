import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return authService.getCurrentUser();
    } catch (error) {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return authService.isAuthenticated();
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const newUser = authService.getCurrentUser();
        const newIsAuthenticated = authService.isAuthenticated();
        setUser(newUser);
        setIsAuthenticated(newIsAuthenticated);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const newUser = authService.getCurrentUser();
      const newIsAuthenticated = authService.isAuthenticated();
      setUser(newUser);
      setIsAuthenticated(newIsAuthenticated);
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => window.removeEventListener('authStateChanged', handleAuthChange);
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);
    const newUser = authService.getCurrentUser();
    const newIsAuthenticated = authService.isAuthenticated();
    setUser(newUser);
    setIsAuthenticated(newIsAuthenticated);

    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);

    window.dispatchEvent(new CustomEvent('authStateChanged'));
  }, []);

  const isAdmin = useCallback(() => {
    return user && user.roles && user.roles.includes('ROLE_ADMIN');
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
