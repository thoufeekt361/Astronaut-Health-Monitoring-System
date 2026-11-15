import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cosmic_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('cosmic_token');
      const storedUser = localStorage.getItem('cosmic_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('cosmic_user', JSON.stringify(res.user));
          }
        } catch (error) {
          console.error('Session expired or invalid', error);
          localStorage.removeItem('cosmic_token');
          localStorage.removeItem('cosmic_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authService.login(email, password);
      if (res.token && res.user) {
        localStorage.setItem('cosmic_token', res.token);
        localStorage.setItem('cosmic_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        toast.success(`Welcome aboard, ${res.user.name}`);
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Authentication failed. Check credentials.';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authService.register(name, email, password, role);
      if (res.token && res.user) {
        localStorage.setItem('cosmic_token', res.token);
        localStorage.setItem('cosmic_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        toast.success('Registration successful! Welcome to COSMIC SIX');
        return true;
      }
      return false;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
