
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpaysdxsmxqcivpsprlw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYXlzZHhzbXhxY2l2cHNwcmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjM2MDIsImV4cCI6MjA4NDEzOTYwMn0.EWlABmiNMYese4iEKPZdS8DPodNVdWIX0OLfGe4cS9U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
