import { User } from '../types';

const DEV_AUTH_ENABLED = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

const DEV_USERS: Record<string, User> = {
  admin: {
    id: 'dev-admin',
    name: 'Development Admin',
    email: 'admin@example.com',
    role: 'admin'
  },
  professional: {
    id: 'dev-professional',
    name: 'Development Professional',
    email: 'professional@example.com',
    role: 'professional'
  },
  investor: {
    id: 'dev-investor',
    name: 'Development Investor',
    email: 'investor@example.com',
    role: 'investor'
  },
  student: {
    id: 'dev-student',
    name: 'Development Student',
    email: 'student@example.com',
    role: 'student'
  },
  client: {
    id: 'dev-client',
    name: 'Development Client',
    email: 'client@example.com',
    role: 'client'
  }
};

export function isDevAuthEnabled(): boolean {
  return DEV_AUTH_ENABLED;
}

export function getDevUser(role: string = 'admin'): User | null {
  if (!DEV_AUTH_ENABLED) return null;
  return DEV_USERS[role] || null;
}

export function injectDevSession(role: string = 'admin'): void {
  if (!DEV_AUTH_ENABLED) return;
  
  const user = getDevUser(role);
  if (user) {
    localStorage.setItem('dev_auth_user', JSON.stringify(user));
    localStorage.setItem('dev_auth_role', role);
  }
}

export function clearDevSession(): void {
  localStorage.removeItem('dev_auth_user');
  localStorage.removeItem('dev_auth_role');
}

export function getDevSession(): { user: User | null; role: string | null } {
  if (!DEV_AUTH_ENABLED) {
    return { user: null, role: null };
  }

  try {
    const user = JSON.parse(localStorage.getItem('dev_auth_user') || 'null');
    const role = localStorage.getItem('dev_auth_role');
    return { user, role };
  } catch {
    return { user: null, role: null };
  }
}