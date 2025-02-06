import { supabase } from './index';

export async function checkSupabaseConnection() {
  try {
    // Test with a simple query that doesn't require auth
    const { data, error } = await supabase
      .from('public_data')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export function validateSupabaseConfig() {
  const url = 'https://menyracpmwczxhsrvlxz.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbnlyYWNwbXdjenhoc3J2bHh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MDMxOTQsImV4cCI6MjA1NDM3OTE5NH0.XCOvaAf1n-KXUwimRXEc3WW6eJ6K_5rm0C3ZFN0K7_Y';

  if (!url || !key) {
    console.error('Missing Supabase configuration');
    return false;
  }

  try {
    // Validate URL format
    new URL(url);
    
    // Validate key format (basic JWT structure)
    if (!key.split('.').length === 3) {
      throw new Error('Invalid API key format');
    }

    return true;
  } catch (error) {
    console.error('Invalid Supabase configuration:', error);
    return false;
  }
}