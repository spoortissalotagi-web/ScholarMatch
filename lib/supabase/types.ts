/**
 * ScholarMatch — Supabase Database Types & Interfaces
 * Aligned with VTU / KNSIT AIML Approved Project Synopsis
 * "Scholarship and Government Scheme Eligibility Checker"
 */

export interface Scheme {
  id: string;
  name: string;
  administering_authority: string; // Synopsis: administering authority
  provider: string; // Alias for backward compatibility
  summary: string | null; // Synopsis: summary
  description: string | null; // Alias for backward compatibility
  state: string;
  district?: string | null;
  education_level: string[];
  course: string[];
  category: string[];
  gender: 'All' | 'Female' | 'Male';
  minimum_percentage: number;
  maximum_family_income: number;
  minimum_age: number;
  maximum_age: number;
  benefit: string; // Synopsis: benefit details
  benefit_amount: number;
  application_start_date?: string | null;
  application_end_date?: string | null; // Synopsis: application deadline
  application_url?: string | null; // Synopsis: official URL
  official_url?: string | null; // Primary official link
  source_url?: string | null; // Official reference source (NSP, SSP, myScheme)
  last_verified_at?: string | null; // Synopsis: last-verified date
  required_documents: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Backward compatibility alias
export type Scholarship = Scheme;

export interface EligibilityRule {
  id: string;
  scheme_id: string;
  scholarship_id?: string; // Backward compatibility
  criterion_type:
    | 'income'
    | 'percentage'
    | 'category'
    | 'state'
    | 'education_level'
    | 'course'
    | 'gender'
    | 'age'
    | 'disability';
  comparison_operator: 'lte' | 'gte' | 'eq' | 'in' | 'contains';
  operator?: 'lte' | 'gte' | 'eq' | 'in' | 'contains'; // Backward compatibility
  comparison_value: string;
  criterion_value?: string; // Backward compatibility
  is_mandatory: boolean; // Synopsis: mandatory / optional status
  additional_notes?: string | null;
  created_at?: string;
}

export interface RequiredDocument {
  id: string;
  scheme_id: string;
  document_name: string;
  is_mandatory: boolean;
  additional_notes?: string | null;
  created_at?: string;
}

export interface SchemeUpdate {
  id: string;
  scheme_id: string;
  source_url: string;
  last_verified_at: string;
  update_notes?: string | null;
  created_at?: string;
}

export interface StudentProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  age: number;
  gender: string;
  state: string;
  district: string;
  education_level: string;
  course: string;
  year_of_study: string;
  percentage: number;
  annual_family_income: number;
  category: string;
  income_certificate: boolean;
  caste_certificate: boolean;
  domicile_certificate: boolean;
  disability_status: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavedScholarship {
  id: string;
  user_id: string;
  scholarship_id: string;
  created_at: string;
  scholarships?: Scholarship;
  schemes?: Scheme;
}

export interface AdminUser {
  id?: string;
  user_id: string;
  username?: string;
  email: string;
  role: 'admin' | 'evaluator' | 'superadmin';
  created_at?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      schemes: {
        Row: Scheme;
        Insert: Partial<Scheme>;
        Update: Partial<Scheme>;
      };
      scholarships: {
        Row: Scholarship;
        Insert: Partial<Scholarship>;
        Update: Partial<Scholarship>;
      };
      eligibility_rules: {
        Row: EligibilityRule;
        Insert: Partial<EligibilityRule>;
        Update: Partial<EligibilityRule>;
      };
      required_documents: {
        Row: RequiredDocument;
        Insert: Partial<RequiredDocument>;
        Update: Partial<RequiredDocument>;
      };
      scheme_updates: {
        Row: SchemeUpdate;
        Insert: Partial<SchemeUpdate>;
        Update: Partial<SchemeUpdate>;
      };
      student_profiles: {
        Row: StudentProfile;
        Insert: Partial<StudentProfile>;
        Update: Partial<StudentProfile>;
      };
      saved_scholarships: {
        Row: SavedScholarship;
        Insert: Partial<SavedScholarship>;
        Update: Partial<SavedScholarship>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser>;
        Update: Partial<AdminUser>;
      };
    };
  };
}
