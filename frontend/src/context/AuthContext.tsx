<<<<<<< HEAD
import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types';
import apiClient from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { username, password });
    const { token: jwt, role } = res.data;
    localStorage.setItem('token', jwt);
    const userData: User = { id: 0, username, email: '', role: role as User['role'], createdAt: '' };
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, role: string) => {
    await apiClient.post('/auth/register', { username, email, password, role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
=======
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (token: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  const login = (newToken: string, newRole: string) => {
    setToken(newToken);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
>>>>>>> 75c08c974147a000c352e1c4f8528ef5332f1bfe
      {children}
    </AuthContext.Provider>
  );
}
<<<<<<< HEAD
=======

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
>>>>>>> 75c08c974147a000c352e1c4f8528ef5332f1bfe
