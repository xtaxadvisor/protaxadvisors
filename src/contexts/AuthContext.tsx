import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/client';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useNotificationStore } from '../lib/store';
import { AuthService } from '../services/auth/authService';
import { isDevAuthEnabled, getDevSession, injectDevSession } from '../lib/auth/devBypass';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: {
    name: string;
    role: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  // Check for dev auth bypass
  const devAuth = isDevAuthEnabled();
  const { user: devUser } = getDevSession();
  
  const user = devAuth ? devUser : supabaseUser;
  const loading = devAuth ? false : supabaseLoading;

  useEffect(() => {
    if (devAuth && !devUser) {
      // Auto-inject dev session if enabled but not present
      injectDevSession();
    }
  }, [devAuth, devUser]);

  const login = async (email: string, password: string) => {
    try {
      if (devAuth) {
        const role = email.split('@')[0];
        injectDevSession(role);
        addNotification('Development mode: Auto-login successful', 'success');
        navigate('/dashboard');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) throw error;

      addNotification('Successfully logged in', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      addNotification(
        error instanceof Error ? error.message : 'Failed to log in',
        'error'
      );
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: {
    name: string;
    role: string;
  }) => {
    if (devAuth) {
      injectDevSession(userData.role);
      addNotification('Development mode: Auto-registration successful', 'success');
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: userData.name.trim(),
            role: userData.role
          }
        }
      });

      if (error) throw error;

      addNotification('Successfully registered. Please check your email.', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      addNotification(
        error instanceof Error ? error.message : 'Failed to register',
        'error'
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (devAuth) {
        clearDevSession();
        addNotification('Development mode: Logged out', 'success');
        navigate('/');
        return;
      }

      await supabase.auth.signOut();
      addNotification('Successfully logged out', 'success');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      addNotification(
        error instanceof Error ? error.message : 'Failed to log out',
        'error'
      );
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
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