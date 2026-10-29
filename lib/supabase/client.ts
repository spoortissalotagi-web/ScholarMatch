/**
 * ScholarMatch — Supabase Client Layer
 * Handles Supabase initialization with safe fallback when credentials are pending.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, Scholarship, StudentProfile, SavedScholarship } from './types';
import { INITIAL_SCHOLARSHIPS } from '../sampleData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Create Supabase singleton instance if configured, otherwise mock/dummy
export const supabase: any = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    );

/**
 * Fetch all active scholarships from Supabase
 * Falls back to initial seed dataset if Supabase is unconfigured or returns empty.
 */
export async function getActiveScholarships(): Promise<Scholarship[]> {
  if (!isSupabaseConfigured) {
    // If running in development without credentials yet, use localStorage or seed records
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('scholarmatch_custom_schemes');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return INITIAL_SCHOLARSHIPS;
  }

  try {
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('is_active', true)
      .order('benefit_amount', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed, falling back to seed catalog:', error.message);
      return INITIAL_SCHOLARSHIPS;
    }

    if (data && data.length > 0) {
      return data as Scholarship[];
    }
    return INITIAL_SCHOLARSHIPS;
  } catch (err) {
    console.error('Error fetching scholarships:', err);
    return INITIAL_SCHOLARSHIPS;
  }
}

/**
 * Fetch a single scholarship by ID
 */
export async function getScholarshipById(id: string): Promise<Scholarship | null> {
  const all = await getActiveScholarships();
  return all.find(s => s.id === id) || null;
}

/**
 * Fetch user saved scholarships (Bookmarks)
 */
export async function getUserSavedScholarships(userId: string): Promise<Scholarship[]> {
  if (!userId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('saved_scholarships')
        .select('scholarship_id, scholarships(*)')
        .eq('user_id', userId);

      if (!error && data) {
        return data
          .map((item: any) => item.scholarships)
          .filter(Boolean) as Scholarship[];
      }
    } catch (e) {
      console.warn('Error fetching saved scholarships from Supabase:', e);
    }
  }

  // LocalStorage fallback for guests / offline
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`saved_${userId}`) || localStorage.getItem('saved_guest');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        const all = await getActiveScholarships();
        return all.filter(s => ids.includes(s.id));
      } catch (e) {}
    }
  }
  return [];
}

/**
 * Toggle bookmark for logged in or guest user
 */
export async function toggleSaveScholarship(userId: string | null, scholarshipId: string): Promise<boolean> {
  if (isSupabaseConfigured && userId) {
    try {
      // Check if already saved
      const { data } = await supabase
        .from('saved_scholarships')
        .select('id')
        .eq('user_id', userId)
        .eq('scholarship_id', scholarshipId)
        .maybeSingle();

      if (data) {
        // Delete
        await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', userId)
          .eq('scholarship_id', scholarshipId);
        return false;
      } else {
        // Insert
        await supabase
          .from('saved_scholarships')
          .insert({ user_id: userId, scholarship_id: scholarshipId });
        return true;
      }
    } catch (err) {
      console.warn('Supabase toggle bookmark failed:', err);
    }
  }

  // LocalStorage fallback
  if (typeof window !== 'undefined') {
    const key = userId ? `saved_${userId}` : 'saved_guest';
    const raw = localStorage.getItem(key);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    const exists = ids.includes(scholarshipId);
    if (exists) {
      ids = ids.filter(id => id !== scholarshipId);
      localStorage.setItem(key, JSON.stringify(ids));
      return false;
    } else {
      ids.push(scholarshipId);
      localStorage.setItem(key, JSON.stringify(ids));
      return true;
    }
  }
  return false;
}

/**
 * Save student profile in Supabase
 */
export async function saveStudentProfile(userId: string, profile: StudentProfile): Promise<boolean> {
  if (isSupabaseConfigured && userId) {
    try {
      const { error } = await supabase
        .from('student_profiles')
        .upsert({
          ...profile,
          user_id: userId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (!error) return true;
      console.warn('Supabase profile save error:', error.message);
    } catch (e) {}
  }

  // Local storage cache
  if (typeof window !== 'undefined') {
    localStorage.setItem('scholarmatch_last_profile', JSON.stringify(profile));
  }
  return true;
}

/**
 * Fetch student profile
 */
export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) return data as StudentProfile;
    } catch (e) {}
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('scholarmatch_last_profile');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
  }
  return null;
}
