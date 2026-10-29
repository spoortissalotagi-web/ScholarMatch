-- ============================================================================
-- ScholarMatch — Complete Supabase PostgreSQL Schema
-- Aligned with VTU / KNSIT AIML Approved Project Synopsis
-- Project: "SCHOLARSHIP AND GOVERNMENT SCHEME ELIGIBILITY CHECKER"
-- Tables: schemes (scholarships), eligibility_rules, required_documents,
--         scheme_updates, student_profiles, saved_scholarships, admin_users
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TABLE: schemes (also aliased/synonymous with scholarships)
-- Synopsis: Scheme ID, scheme name, administering authority, summary, benefit details, official URL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    administering_authority TEXT NOT NULL,
    provider TEXT NOT NULL, -- Backward compatibility alias
    summary TEXT,
    description TEXT, -- Backward compatibility alias
    state TEXT NOT NULL DEFAULT 'All India',
    district TEXT,
    education_level TEXT[] NOT NULL DEFAULT ARRAY['Undergraduate'],
    course TEXT[] NOT NULL DEFAULT ARRAY['All Courses'],
    category TEXT[] NOT NULL DEFAULT ARRAY['General', 'OBC', 'SC', 'ST'],
    gender TEXT NOT NULL DEFAULT 'All',
    minimum_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    maximum_family_income NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    minimum_age INTEGER DEFAULT 14,
    maximum_age INTEGER DEFAULT 75,
    benefit TEXT NOT NULL,
    benefit_amount NUMERIC(10, 2) DEFAULT 0.0,
    application_start_date DATE,
    application_end_date DATE, -- Synopsis: application deadline
    official_url TEXT, -- Synopsis: official URL
    application_url TEXT, -- Backward compatibility alias
    source_url TEXT DEFAULT 'https://scholarships.gov.in', -- Synopsis: source URL (NSP, SSP, myScheme)
    last_verified_at DATE DEFAULT CURRENT_DATE, -- Synopsis: last-verified date
    required_documents TEXT[] DEFAULT ARRAY['Income Certificate', 'Marks Card', 'Aadhaar Card'],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for high-performance filtering
CREATE INDEX IF NOT EXISTS idx_schemes_active ON public.schemes(is_active);
CREATE INDEX IF NOT EXISTS idx_schemes_state ON public.schemes(state);
CREATE INDEX IF NOT EXISTS idx_schemes_income ON public.schemes(maximum_family_income);
CREATE INDEX IF NOT EXISTS idx_schemes_pct ON public.schemes(minimum_percentage);

-- Maintain backward-compatible table or view 'scholarships'
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    administering_authority TEXT,
    provider TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    state TEXT NOT NULL DEFAULT 'All India',
    district TEXT,
    education_level TEXT[] NOT NULL DEFAULT ARRAY['Undergraduate'],
    course TEXT[] NOT NULL DEFAULT ARRAY['All Courses'],
    category TEXT[] NOT NULL DEFAULT ARRAY['General', 'OBC', 'SC', 'ST'],
    gender TEXT NOT NULL DEFAULT 'All',
    minimum_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    maximum_family_income NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    minimum_age INTEGER DEFAULT 14,
    maximum_age INTEGER DEFAULT 75,
    benefit TEXT NOT NULL,
    benefit_amount NUMERIC(10, 2) DEFAULT 0.0,
    application_start_date DATE,
    application_end_date DATE,
    official_url TEXT,
    application_url TEXT,
    source_url TEXT DEFAULT 'https://scholarships.gov.in',
    last_verified_at DATE DEFAULT CURRENT_DATE,
    required_documents TEXT[] DEFAULT ARRAY['Income Certificate', 'Marks Card', 'Aadhaar Card'],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. TABLE: eligibility_rules
-- Synopsis: Rule ID, scheme ID, criterion type, condition, comparison value and mandatory/optional status
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    criterion_type TEXT NOT NULL CHECK (criterion_type IN ('income', 'percentage', 'category', 'state', 'education_level', 'course', 'gender', 'age', 'disability')),
    comparison_operator TEXT NOT NULL CHECK (comparison_operator IN ('lte', 'gte', 'eq', 'in', 'contains')),
    comparison_value TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true, -- Synopsis: mandatory / optional status
    additional_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_eligibility_rules_scheme ON public.eligibility_rules(scheme_id);

-- ----------------------------------------------------------------------------
-- 3. TABLE: required_documents
-- Synopsis: Document ID, scheme ID, document name and notes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.required_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    additional_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_required_documents_scheme ON public.required_documents(scheme_id);

-- ----------------------------------------------------------------------------
-- 4. TABLE: scheme_updates
-- Synopsis: Update ID, scheme ID, source URL, last-verified date and update notes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheme_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    last_verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
    update_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheme_updates_scheme ON public.scheme_updates(scheme_id);

-- ----------------------------------------------------------------------------
-- 5. TABLE: student_profiles (Users Table in Synopsis)
-- Synopsis: Profile ID, course level, year of study, state, income range and applicable criteria
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    age INTEGER CHECK (age >= 10 AND age <= 100),
    gender TEXT,
    state TEXT NOT NULL DEFAULT 'Karnataka',
    district TEXT,
    education_level TEXT NOT NULL DEFAULT 'Undergraduate',
    course TEXT NOT NULL DEFAULT 'B.Tech/B.E',
    year_of_study TEXT DEFAULT '1st Year',
    percentage NUMERIC(5, 2) DEFAULT 0.0,
    annual_family_income NUMERIC(12, 2) DEFAULT 0.0,
    category TEXT DEFAULT 'General',
    income_certificate BOOLEAN DEFAULT false,
    caste_certificate BOOLEAN DEFAULT false,
    domicile_certificate BOOLEAN DEFAULT false,
    disability_status BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user ON public.student_profiles(user_id);

-- ----------------------------------------------------------------------------
-- 6. TABLE: saved_scholarships (Bookmarks)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scholarship_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, scholarship_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_scholarships_user ON public.saved_scholarships(user_id);

-- ----------------------------------------------------------------------------
-- 7. TABLE: admin_users
-- Synopsis: Admin ID, username, password hash and role
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'evaluator', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. AUTOMATIC UPDATED_AT TRIGGER
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_schemes_updated_at ON public.schemes;
CREATE TRIGGER trigger_schemes_updated_at
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_scholarships_updated_at ON public.scholarships;
CREATE TRIGGER trigger_scholarships_updated_at
    BEFORE UPDATE ON public.scholarships
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER trigger_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email'
    ) OR (
        auth.jwt() ->> 'email' IN ('admin@scholarmatch.gov.in', 'evaluator@college.edu', 'spoorti@knsit.ac.in')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. SCHEMES RLS
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active schemes" ON public.schemes;
CREATE POLICY "Public can view active schemes"
    ON public.schemes FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage schemes" ON public.schemes;
CREATE POLICY "Admins can manage schemes"
    ON public.schemes FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active scholarships" ON public.scholarships;
CREATE POLICY "Public can view active scholarships"
    ON public.scholarships FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage scholarships" ON public.scholarships;
CREATE POLICY "Admins can manage scholarships"
    ON public.scholarships FOR ALL
    USING (public.is_admin());

-- 2. ELIGIBILITY RULES & REQUIRED DOCUMENTS RLS
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view eligibility rules" ON public.eligibility_rules FOR SELECT USING (true);
CREATE POLICY "Admins can modify eligibility rules" ON public.eligibility_rules FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view required documents" ON public.required_documents FOR SELECT USING (true);
CREATE POLICY "Admins can modify required documents" ON public.required_documents FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view scheme updates" ON public.scheme_updates FOR SELECT USING (true);
CREATE POLICY "Admins can modify scheme updates" ON public.scheme_updates FOR ALL USING (public.is_admin());

-- 3. STUDENT PROFILES RLS
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. SAVED SCHOLARSHIPS RLS
ALTER TABLE public.saved_scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved scholarships" ON public.saved_scholarships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save scholarships" ON public.saved_scholarships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove saved scholarships" ON public.saved_scholarships FOR DELETE USING (auth.uid() = user_id);
