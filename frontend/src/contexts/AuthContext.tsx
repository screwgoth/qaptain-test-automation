/**
 * Authentication Context
 * Manages user authentication state and operations
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, LoginCredentials, RegisterData, AuthResponse, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('qaptain_token');
      const storedUser = localStorage.getItem('qaptain_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching current user
          await refreshUser();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('qaptain_token');
          localStorage.removeItem('qaptain_user');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Auto-refresh token before expiry (every 50 minutes if token expires in 1 hour)
  useEffect(() => {
    if (!token) return;

    const refreshInterval = setInterval(async () => {
      try {
        const response = await api.post<{ token: string }>('/api/auth/refresh');
        const newToken = response.data.token;
        localStorage.setItem('qaptain_token', newToken);
        setToken(newToken);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        logout();
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [token]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials);
      const { user: userData, token: authToken } = response.data;

      localStorage.setItem('qaptain_token', authToken);
      localStorage.setItem('qaptain_user', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', data);
      const { user: userData, token: authToken } = response.data;

      localStorage.setItem('qaptain_token', authToken);
      localStorage.setItem('qaptain_user', JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('qaptain_token');
    localStorage.removeItem('qaptain_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get<{ user: User }>('/api/auth/me');
      const userData = response.data.user;
      
      localStorage.setItem('qaptain_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
