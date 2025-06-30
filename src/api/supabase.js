import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jcjjboqpvequwxqsahah.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjampib3FwdmVxdXd4cXNhaGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjM0MjMsImV4cCI6MjA2NjYzOTQyM30.CZtgF1MXgIfDCjzpdM8lIAKuRM4OW-mvx2HrufVz1l4';
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 