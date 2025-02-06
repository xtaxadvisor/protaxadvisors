import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { useNotificationStore } from '../store';

// Get configuration with fallbacks
const config = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://xfkawqvbfzxnqfsnprgj.supabase.co',
  key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhma2F3cXZiZnp4bnFmc25wcmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDUwMjQwMDAsImV4cCI6MjAyMDYwMDAwMH0.qgkN_0VQbc3GlDKKKe_WfZgk2jGV-BO_KBy8K_KRr_I'
};

// Create Supabase client
export const supabase = createClient<Database>(config.url, config.key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token'
  },
  db: {
    schema: 'public'
  }
});

// Initialize error handler
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.removeItem('supabase.auth.token');
  }

  if (event === 'TOKEN_REFRESHED') {
    useNotificationStore.getState().addNotification(
      'Session refreshed successfully',
      'success'
    );
  }
});