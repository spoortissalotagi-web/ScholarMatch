-- ============================================================================
-- ScholarMatch — Seed SQL for Supabase
-- Aligned with VTU / KNSIT AIML Approved Project Synopsis
-- Populates schemes, eligibility_rules, required_documents, and scheme_updates
-- with verified department providers from NSP, Karnataka SSP, and myScheme.
-- ============================================================================

-- Clear existing data
TRUNCATE TABLE public.saved_scholarships CASCADE;
TRUNCATE TABLE public.required_documents CASCADE;
TRUNCATE TABLE public.eligibility_rules CASCADE;
TRUNCATE TABLE public.scheme_updates CASCADE;
DELETE FROM public.scholarships;
DELETE FROM public.schemes;

-- ----------------------------------------------------------------------------
-- 1. Central Sector Scheme of Scholarships for College and University Students
-- ----------------------------------------------------------------------------
INSERT INTO public.schemes (
    id,
    name,
    administering_authority,
    provider,
    summary,
    description,
    state,
    education_level,
    course,
    category,
    gender,
    minimum_percentage,
    maximum_family_income,
    minimum_age,
    maximum_age,
    benefit,
    benefit_amount,
    application_start_date,
    application_end_date,
    official_url,
    application_url,
    source_url,
    last_verified_at,
    required_documents,
    is_active
) VALUES (
    'a1111111-1111-1111-1111-111111111101',
    'Central Sector Scheme of Scholarships for College and University Students',
    'Department of Higher Education, Ministry of Education, Govt. of India',
    'Department of Higher Education, Ministry of Education, Govt. of India',
    'Provides financial support to meritorious students from low-income families pursuing regular degree courses in recognized universities and colleges across India.',
    'Provides financial support to meritorious students from low-income families pursuing regular degree courses in recognized universities and colleges across India.',
    'All India',
    ARRAY['Undergraduate', 'Postgraduate'],
    ARRAY['All Courses'],
    ARRAY['General', 'OBC', 'SC', 'ST', 'EWS'],
    'All',
    80.0,
    450000.0,
    17,
    28,
    '₹12,000 per annum at Graduation level for first 3 years and ₹20,000 per annum at Post-Graduation level.',
    20000.0,
    '2026-07-01',
    '2026-11-30',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    '2026-10-15',
    ARRAY['Class 12th / Qualifying Marks Card', 'Annual Family Income Certificate (< ₹4.5 Lakh)', 'Aadhaar Linked Bank Passbook', 'College Bonafide Certificate', 'Current Year Fee Receipt'],
    true
);

-- Copy to scholarships table for backward compatibility
INSERT INTO public.scholarships SELECT * FROM public.schemes WHERE id = 'a1111111-1111-1111-1111-111111111101';

-- Rules for Scheme 1
INSERT INTO public.eligibility_rules (scheme_id, criterion_type, comparison_operator, comparison_value, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111101', 'percentage', 'gte', '80.0', true, 'Above 80th percentile in Class 12 board examination'),
('a1111111-1111-1111-1111-111111111101', 'income', 'lte', '450000.0', true, 'Gross annual parental/family income cannot exceed ₹4.5 Lakh'),
('a1111111-1111-1111-1111-111111111101', 'education_level', 'in', 'Undergraduate, Postgraduate', true, 'Must pursue regular degree program');

-- Documents for Scheme 1
INSERT INTO public.required_documents (scheme_id, document_name, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111101', 'Class 12th Marks Card', true, 'Showing score above cutoff percentile'),
('a1111111-1111-1111-1111-111111111101', 'Income Certificate', true, 'Issued by Competent Revenue Authority (< ₹4.5 Lakh)'),
('a1111111-1111-1111-1111-111111111101', 'College Bonafide Certificate', true, 'Signed by Head of Institution');

-- Update log for Scheme 1
INSERT INTO public.scheme_updates (scheme_id, source_url, last_verified_at, update_notes) VALUES
('a1111111-1111-1111-1111-111111111101', 'https://scholarships.gov.in', '2026-10-15', 'Verified guidelines on National Scholarship Portal');


-- ----------------------------------------------------------------------------
-- 2. Post-Matric Scholarship for SC Students
-- ----------------------------------------------------------------------------
INSERT INTO public.schemes (
    id,
    name,
    administering_authority,
    provider,
    summary,
    description,
    state,
    education_level,
    course,
    category,
    gender,
    minimum_percentage,
    maximum_family_income,
    minimum_age,
    maximum_age,
    benefit,
    benefit_amount,
    application_start_date,
    application_end_date,
    official_url,
    application_url,
    source_url,
    last_verified_at,
    required_documents,
    is_active
) VALUES (
    'a1111111-1111-1111-1111-111111111102',
    'Post-Matric Scholarship for Scheduled Caste (SC) Students',
    'Ministry of Social Justice & Empowerment, Govt. of India',
    'Ministry of Social Justice & Empowerment, Govt. of India',
    'Centrally sponsored scheme operated through State Welfare Directorates providing comprehensive tuition reimbursement and maintenance allowances to SC students.',
    'Centrally sponsored scheme operated through State Welfare Directorates providing comprehensive tuition reimbursement and maintenance allowances to SC students.',
    'All India',
    ARRAY['PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate'],
    ARRAY['All Courses'],
    ARRAY['SC'],
    'All',
    40.0,
    250000.0,
    15,
    35,
    '100% compulsory non-refundable fees reimbursement plus monthly maintenance allowance up to ₹13,500/year.',
    45000.0,
    '2026-08-01',
    '2026-12-15',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    '2026-10-15',
    ARRAY['Caste Certificate issued by Revenue Authority', 'Income Certificate (< ₹2.5 Lakh)', 'Marks Sheet', 'College Fee Breakdown Receipt', 'Aadhaar Linked Bank Passbook'],
    true
);

INSERT INTO public.scholarships SELECT * FROM public.schemes WHERE id = 'a1111111-1111-1111-1111-111111111102';

INSERT INTO public.eligibility_rules (scheme_id, criterion_type, comparison_operator, comparison_value, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111102', 'category', 'eq', 'SC', true, 'Student must belong to Scheduled Caste (SC)'),
('a1111111-1111-1111-1111-111111111102', 'income', 'lte', '250000.0', true, 'Parental annual income ceiling ₹2.5 Lakh');

INSERT INTO public.required_documents (scheme_id, document_name, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111102', 'SC Caste Certificate', true, 'With verifiable RD/barcode number'),
('a1111111-1111-1111-1111-111111111102', 'Income Certificate', true, 'Valid revenue department income certificate');

INSERT INTO public.scheme_updates (scheme_id, source_url, last_verified_at, update_notes) VALUES
('a1111111-1111-1111-1111-111111111102', 'https://scholarships.gov.in', '2026-10-15', 'Verified on Ministry of Social Justice guidelines');


-- ----------------------------------------------------------------------------
-- 3. Post-Matric Scholarship for OBC - Karnataka SSP
-- ----------------------------------------------------------------------------
INSERT INTO public.schemes (
    id,
    name,
    administering_authority,
    provider,
    summary,
    description,
    state,
    education_level,
    course,
    category,
    gender,
    minimum_percentage,
    maximum_family_income,
    minimum_age,
    maximum_age,
    benefit,
    benefit_amount,
    application_start_date,
    application_end_date,
    official_url,
    application_url,
    source_url,
    last_verified_at,
    required_documents,
    is_active
) VALUES (
    'a1111111-1111-1111-1111-111111111104',
    'Post-Matric Scholarship for Other Backward Classes (OBC) - Karnataka SSP',
    'Department of Backward Classes Welfare, Govt. of Karnataka',
    'Department of Backward Classes Welfare, Govt. of Karnataka',
    'Fee concession and maintenance allowance for students belonging to backward classes pursuing collegiate courses in recognized institutions in Karnataka.',
    'Fee concession and maintenance allowance for students belonging to backward classes pursuing collegiate courses in recognized institutions in Karnataka.',
    'Karnataka',
    ARRAY['PUC / 12th', 'Diploma', 'Undergraduate', 'Postgraduate'],
    ARRAY['All Courses'],
    ARRAY['OBC'],
    'All',
    50.0,
    250000.0,
    16,
    35,
    'Tuition fee reimbursement directly to college and student maintenance allowance up to ₹10,000/year.',
    25000.0,
    '2026-09-01',
    '2026-11-30',
    'https://ssp.postmatric.karnataka.gov.in',
    'https://ssp.postmatric.karnataka.gov.in',
    'https://ssp.postmatric.karnataka.gov.in',
    '2026-10-15',
    ARRAY['OBC Caste Certificate with valid RD number', 'Income Certificate (< ₹2.5 Lakh)', 'Karnataka Domicile / Ration Card', 'SSLC & Previous Grade Sheet', 'College Fee Receipt'],
    true
);

INSERT INTO public.scholarships SELECT * FROM public.schemes WHERE id = 'a1111111-1111-1111-1111-111111111104';

INSERT INTO public.eligibility_rules (scheme_id, criterion_type, comparison_operator, comparison_value, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111104', 'state', 'eq', 'Karnataka', true, 'Applicant must be a permanent resident of Karnataka'),
('a1111111-1111-1111-1111-111111111104', 'category', 'eq', 'OBC', true, 'Belong to 2A, 2B, 3A, 3B or Cat-1 OBC categories'),
('a1111111-1111-1111-1111-111111111104', 'income', 'lte', '250000.0', true, 'Income ceiling up to ₹2.5 Lakh');

INSERT INTO public.required_documents (scheme_id, document_name, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111104', 'Karnataka RD Caste & Income Certificate', true, 'Seeded with Aadhaar on SSP portal'),
('a1111111-1111-1111-1111-111111111104', 'College Fee Receipt & Bonafide', true, 'From recognized college in Karnataka');

INSERT INTO public.scheme_updates (scheme_id, source_url, last_verified_at, update_notes) VALUES
('a1111111-1111-1111-1111-111111111104', 'https://ssp.postmatric.karnataka.gov.in', '2026-10-15', 'Verified on Karnataka SSP Post-Matric circular 2026');


-- ----------------------------------------------------------------------------
-- 4. AICTE Pragati Scholarship Scheme for Girl Students (Technical Degree)
-- ----------------------------------------------------------------------------
INSERT INTO public.schemes (
    id,
    name,
    administering_authority,
    provider,
    summary,
    description,
    state,
    education_level,
    course,
    category,
    gender,
    minimum_percentage,
    maximum_family_income,
    minimum_age,
    maximum_age,
    benefit,
    benefit_amount,
    application_start_date,
    application_end_date,
    official_url,
    application_url,
    source_url,
    last_verified_at,
    required_documents,
    is_active
) VALUES (
    'a1111111-1111-1111-1111-111111111105',
    'AICTE Pragati Scholarship Scheme for Girl Students (Technical Degree)',
    'All India Council for Technical Education (AICTE), Ministry of Education',
    'All India Council for Technical Education (AICTE)',
    'Government initiative to encourage female empowerment in engineering and technical education. Grants ₹50,000/year to girl students admitted to AICTE approved technical degrees.',
    'Government initiative to encourage female empowerment in engineering and technical education. Grants ₹50,000/year to girl students admitted to AICTE approved technical degrees.',
    'All India',
    ARRAY['Undergraduate'],
    ARRAY['Engineering', 'B.Tech/B.E', 'Technology', 'Architecture', 'Pharmacy'],
    ARRAY['General', 'OBC', 'SC', 'ST', 'EWS'],
    'Female',
    60.0,
    800000.0,
    17,
    26,
    '₹50,000 per annum for every year of study towards college fee payment, computer purchase, books and stationery.',
    50000.0,
    '2026-08-15',
    '2026-12-31',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    '2026-10-15',
    ARRAY['Class 12th / Qualifying Marks Sheet', 'AICTE Approved Institution Admission Letter', 'Annual Family Income Certificate (< ₹8 Lakh)', 'Aadhaar Card', 'Tuition Fee Payment Receipt'],
    true
);

INSERT INTO public.scholarships SELECT * FROM public.schemes WHERE id = 'a1111111-1111-1111-1111-111111111105';

INSERT INTO public.eligibility_rules (scheme_id, criterion_type, comparison_operator, comparison_value, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111105', 'gender', 'eq', 'Female', true, 'Exclusive scheme for female students'),
('a1111111-1111-1111-1111-111111111105', 'income', 'lte', '800000.0', true, 'Family income ceiling of ₹8 Lakh'),
('a1111111-1111-1111-1111-111111111105', 'course', 'contains', 'B.Tech/B.E, Engineering', true, 'Enrolled in 1st year of AICTE approved technical degree');

INSERT INTO public.required_documents (scheme_id, document_name, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111105', 'AICTE Technical College Admission Letter', true, 'Through centralized counseling process'),
('a1111111-1111-1111-1111-111111111105', 'Income Certificate', true, 'Showing annual family income <= 8 Lakh');

INSERT INTO public.scheme_updates (scheme_id, source_url, last_verified_at, update_notes) VALUES
('a1111111-1111-1111-1111-111111111105', 'https://scholarships.gov.in', '2026-10-15', 'Verified on AICTE official notification');


-- ----------------------------------------------------------------------------
-- 5. AICTE Saksham Scholarship Scheme for Specially-Abled Students
-- ----------------------------------------------------------------------------
INSERT INTO public.schemes (
    id,
    name,
    administering_authority,
    provider,
    summary,
    description,
    state,
    education_level,
    course,
    category,
    gender,
    minimum_percentage,
    maximum_family_income,
    minimum_age,
    maximum_age,
    benefit,
    benefit_amount,
    application_start_date,
    application_end_date,
    official_url,
    application_url,
    source_url,
    last_verified_at,
    required_documents,
    is_active
) VALUES (
    'a1111111-1111-1111-1111-111111111106',
    'AICTE Saksham Scholarship Scheme for Specially-Abled Students',
    'All India Council for Technical Education (AICTE), Ministry of Education',
    'All India Council for Technical Education (AICTE)',
    'Financial support dedicated exclusively to students with verified physical disabilities (not less than 40%) admitted to technical degree courses.',
    'Financial support dedicated exclusively to students with verified physical disabilities (not less than 40%) admitted to technical degree courses.',
    'All India',
    ARRAY['Undergraduate', 'Diploma'],
    ARRAY['Engineering', 'B.Tech/B.E', 'Technology', 'Computer Applications'],
    ARRAY['General', 'OBC', 'SC', 'ST', 'EWS'],
    'All',
    50.0,
    800000.0,
    16,
    35,
    '₹50,000 per annum towards tuition fees, specialized equipment, books, and assistive devices.',
    50000.0,
    '2026-08-15',
    '2026-12-31',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    'https://scholarships.gov.in',
    '2026-10-15',
    ARRAY['Disability Certificate (UDID / Minimum 40% disability)', 'Family Income Certificate (< ₹8 Lakh)', 'Admission Letter for AICTE Technical Course', 'Previous Class Marks Card', 'Aadhaar Linked Bank Account'],
    true
);

INSERT INTO public.scholarships SELECT * FROM public.schemes WHERE id = 'a1111111-1111-1111-1111-111111111106';

INSERT INTO public.eligibility_rules (scheme_id, criterion_type, comparison_operator, comparison_value, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111106', 'disability', 'eq', 'true', true, 'UDID or certificate with >= 40% disability'),
('a1111111-1111-1111-1111-111111111106', 'income', 'lte', '800000.0', true, 'Family income ceiling of ₹8 Lakh');

INSERT INTO public.required_documents (scheme_id, document_name, is_mandatory, additional_notes) VALUES
('a1111111-1111-1111-1111-111111111106', 'UDID Card / Disability Certificate', true, 'Issued by Competent Medical Authority (>= 40%)');

INSERT INTO public.scheme_updates (scheme_id, source_url, last_verified_at, update_notes) VALUES
('a1111111-1111-1111-1111-111111111106', 'https://scholarships.gov.in', '2026-10-15', 'Verified on AICTE Saksham guidelines');
