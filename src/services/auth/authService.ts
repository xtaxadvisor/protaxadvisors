import { supabase } from '../../lib/supabase/client';
import { useNotificationStore } from '../../lib/store';
import { validatePassword } from './validation';
import { SECURITY_CONFIG } from '../../lib/security/config';
import { rateLimiter } from '../../lib/security/rateLimit';
import { auditLogger } from '../../lib/security/audit';
import { sanitizeInput } from '../../lib/security/validation';
import type { AuthError } from '@supabase/supabase-js';

export class AuthService {
  private static readonly MAX_RETRIES = 3;
  private static retryCount = 0;

  static async signIn(email: string, password: string) {
    try {
      // Sanitize inputs
      const normalizedEmail = sanitizeInput(email.toLowerCase().trim());
      
      // Check rate limiting
      const ipAddress = 'client-ip'; // In production, get from request
      if (!rateLimiter.checkLimit(`login:${ipAddress}`)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (error) {
        // Special handling for invalid credentials
        if (error.message === 'Invalid login credentials') {
          // Try mock credentials in development
          if (process.env.NODE_ENV === 'development') {
            const mockCredentials = [
              { email: 'client@example.com', password: 'Client123!@#' },
              { email: 'student@example.com', password: 'Student123!@#' },
              { email: 'investor@example.com', password: 'Investor123!@#' },
              { email: 'professional@example.com', password: 'Professional123!@#' },
              { email: 'admin@example.com', password: 'Admin123!@#' }
            ];

            const mockUser = mockCredentials.find(cred => 
              cred.email === normalizedEmail && cred.password === password
            );

            if (mockUser) {
              return {
                user: {
                  id: `mock-${Date.now()}`,
                  email: mockUser.email,
                  role: mockUser.email.split('@')[0],
                  name: mockUser.email.split('@')[0].charAt(0).toUpperCase() + 
                       mockUser.email.split('@')[0].slice(1)
                }
              };
            }
          }
        }
        throw error;
      }

      // Log successful login
      auditLogger.log({
        userId: data.user?.id || 'unknown',
        action: 'login',
        resource: 'auth',
        details: { email: normalizedEmail },
        ipAddress,
        userAgent: navigator.userAgent
      });

      this.retryCount = 0;
      return data;

    } catch (error) {
      this.handleAuthError(error as AuthError);
      return null;
    }
  }

  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const sessionAge = Date.now() - new Date(session.created_at).getTime();
      const isValid = sessionAge < SECURITY_CONFIG.auth.sessionTimeout;

      if (!isValid) {
        await supabase.auth.signOut();
      }

      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  private static handleAuthError(error: AuthError | Error) {
    const errorMessages: Record<string, string> = {
      'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
      'invalid_grant': 'Invalid email or password. Please check your credentials and try again.',
      'user_not_found': 'No account found with this email address.',
      'email_taken': 'An account with this email already exists.',
      'weak_password': 'Password must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters.',
      'rate_limit_exceeded': 'Too many attempts. Please try again in a few minutes.',
      'expired_token': 'Your session has expired. Please sign in again.',
      'invalid_token': 'Invalid authentication token. Please sign in again.'
    };

    const message = errorMessages[error.message] || error.message || 'An unexpected error occurred';
    useNotificationStore.getState().addNotification(message, 'error');

    // Log failed login attempt
    auditLogger.log({
      userId: 'unknown',
      action: 'login_failed',
      resource: 'auth',
      details: { error: error.message },
      ipAddress: 'client-ip',
      userAgent: navigator.userAgent
    });
  }
}