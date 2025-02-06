import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Single source of truth for Supabase configuration
const SUPABASE_CONFIG = {
  url: 'https://menyracpmwczxhsrvlxz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbnlyYWNwbXdjenhoc3J2bHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MDMxOTQsImV4cCI6MjA1NDM3OTE5NH0.XCOvaAf1n-KXUwimRXEc3WW6eJ6K_5rm0C3ZFN0K7_Y'
};

// Create single Supabase client instance
const supabase = createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
});

// Export the client
export { supabase };

// Export as default for compatibility
export default supabase;