/**
 * ScholarMatch — Server-side Supabase Client
 * Safe for Next.js API Routes and Server Actions.
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    return null;
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export function createAdminSupabaseClient() {
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !key || supabaseUrl.includes('your-project')) {
    return null;
  }
  return createClient<Database>(supabaseUrl, key);
}
