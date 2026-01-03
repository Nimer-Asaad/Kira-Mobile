import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { authApi } from '../api/auth';
import { LoginCredentials, SignupData, User } from '../api/types';
import { STORAGE_KEYS } from '../utils/constants';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  updateUser: (data: User) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bootstrappedRef = useRef(false);

  const isAuthenticated = !!user && !!token;

  // Bootstrap: Load token and user on mount
  const bootstrap = async () => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    setIsLoading(true);
    try {
      const storedToken = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          // Token is invalid, clear it
          await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          setToken(null);
        }
      }
    } catch (err) {
      console.error('Bootstrap error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run bootstrap on mount
  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    try {
      const response = await authApi.login(credentials);
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const signup = async (data: SignupData) => {
    setError(null);
    try {
      const response = await authApi.signup(data);
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setUser(null);
    setToken(null);
    setError(null);
  };

  const updateUser = (data: User) => {
    setUser(data);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        error,
        login,
        signup,
        logout,
        bootstrap,
        updateUser,
        clearError,
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
