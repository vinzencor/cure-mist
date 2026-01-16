
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpaysdxsmxqcivpsprlw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYXlzZHhzbXhxY2l2cHNwcmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjM2MDIsImV4cCI6MjA4NDEzOTYwMn0.EWlABmiNMYese4iEKPZdS8DPodNVdWIX0OLfGe4cS9U';

// Get the base URL from the environment or use production URL
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    // Check if we're in production
    if (window.location.hostname === 'cure-mist.vercel.app') {
      return 'https://cure-mist.vercel.app';
    }
    // Use current origin for development
    return window.location.origin;
  }
  return 'https://cure-mist.vercel.app';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const getAuthRedirectUrl = () => getRedirectUrl();
