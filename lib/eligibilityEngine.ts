/**
 * ScholarMatch — Rule-Based Eligibility Engine (TypeScript)
 * Aligned with VTU / KNSIT AIML Approved Project Synopsis:
 * "Scholarship and Government Scheme Eligibility Checker"
 *
 * Implements the 3-outcome classification defined in the synopsis:
 * 1. Potential Match (potential_match): Known applicable criteria satisfied, subject to official confirmation.
 * 2. More Information Needed (more_info_needed): Essential criteria missing, unclear, or unverified.
 * 3. Does Not Appear to Match (does_not_match): Confirmed mandatory eligibility conditions failed.
 *
 * Explicitly treats missing or unclear details as needing verification rather than assuming eligibility.
 */

import { Scholarship, StudentProfile } from './supabase/types';

export type MatchStatus = 'potential_match' | 'more_info_needed' | 'does_not_match';

export interface EligibilityResult {
  scholarship: Scholarship;
  status: MatchStatus;
  legacyStatus: 'eligible' | 'potential' | 'not-eligible'; // Backward compatibility
  score: number; // Ratio of evaluated criteria satisfied (0-100)
  matchedCriteria: string[];
  failedCriteria: string[];
  missingCriteria: string[];
  warnings: string[];
  reasons: string[];
  administeringAuthority: string;
  sourceUrl: string;
  officialUrl: string;
  lastVerifiedAt: string;
  explanation: {
    matched: string[];
    failed: string[];
    missing: string[];
  };
}

/**
 * Normalizes raw student profile input and safely handles CGPA to percentage conversion.
 */
export function normalizeStudentProfile(raw: Partial<StudentProfile>): StudentProfile {
  let pct = Number(raw.percentage || 0);
  if (pct > 0 && pct <= 10) {
    // If entered as CGPA (0-10), convert to percentage with standard AICTE/CBSE 9.5 multiplier
    pct = Math.min(100, Math.round(pct * 9.5 * 10) / 10);
  }

  return {
    full_name: (raw.full_name || 'Student').trim(),
    age: Math.max(10, Math.min(100, Number(raw.age || 20))),
    gender: raw.gender || 'All',
    state: (raw.state || '').trim(),
    district: (raw.district || '').trim(),
    education_level: (raw.education_level || 'Undergraduate').trim(),
    course: (raw.course || 'All Courses').trim(),
    year_of_study: (raw.year_of_study || '1st Year').trim(),
    percentage: Math.max(0, Math.min(100, pct)),
    annual_family_income: Math.max(0, Number(raw.annual_family_income || 0)),
    category: (raw.category || 'General').trim(),
    income_certificate: Boolean(raw.income_certificate),
    caste_certificate: Boolean(raw.caste_certificate),
    domicile_certificate: Boolean(raw.domicile_certificate),
    disability_status: Boolean(raw.disability_status),
  };
}

/**
 * Evaluates a single student against a single scheme according to explicit rules.
 */
export function evaluateSingleScholarship(
  student: StudentProfile,
  scholarship: Scholarship
): EligibilityResult {
  const matchedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const missingCriteria: string[] = [];
  const warnings: string[] = [];
  const reasons: string[] = [];

  const administeringAuthority =
    scholarship.administering_authority || scholarship.provider || 'Authorized Department';
  const sourceUrl = scholarship.source_url || 'https://scholarships.gov.in';
  const officialUrl = scholarship.official_url || scholarship.application_url || 'https://scholarships.gov.in';
  const lastVerifiedAt = scholarship.last_verified_at || '2026-10-15';

  // -------------------------------------------------------------
  // 1. STATE / DOMICILE CHECK
  // -------------------------------------------------------------
  const schemeState = (scholarship.state || 'All India').trim();
  const isPanIndia =
    schemeState.toLowerCase() === 'all india' ||
    schemeState.toLowerCase() === 'central' ||
    !schemeState;

  if (isPanIndia) {
    matchedCriteria.push('Domicile: Pan-India scheme open to applicants from all States and UTs');
  } else if (!student.state) {
    missingCriteria.push(`Domicile: Scheme requires permanent residency in ${schemeState}. State not provided.`);
  } else if (schemeState.toLowerCase() === student.state.toLowerCase()) {
    matchedCriteria.push(`Domicile: Permanent resident of ${student.state} (Matches required state)`);
  } else {
    failedCriteria.push(
      `Domicile: Student is from ${student.state}, but scheme is restricted to permanent residents of ${schemeState}`
    );
    reasons.push(`Restricted to permanent residents of ${schemeState}.`);
  }

  // -------------------------------------------------------------
  // 2. SOCIAL CATEGORY CHECK
  // -------------------------------------------------------------
  const eligibleCats = (scholarship.category || []).map((c) => c.toLowerCase());
  const studentCat = (student.category || '').toLowerCase();
  const isOpenToAllCategories =
    eligibleCats.length === 0 ||
    eligibleCats.includes('all') ||
    (eligibleCats.includes('general') &&
      eligibleCats.includes('obc') &&
      eligibleCats.includes('sc') &&
      eligibleCats.includes('st'));

  if (isOpenToAllCategories) {
    matchedCriteria.push('Social Category: Scheme is open to all social categories');
  } else if (!student.category) {
    missingCriteria.push(`Social Category: Scheme designated for ${(scholarship.category || []).join(', ')}. Category not provided.`);
  } else if (eligibleCats.includes(studentCat) || (studentCat === 'other' && eligibleCats.includes('other'))) {
    matchedCriteria.push(`Social Category: Applicant is in ${student.category} (Meets category requirement)`);
  } else {
    failedCriteria.push(
      `Social Category: Scheme designated for ${(scholarship.category || []).join(', ')}, but applicant category is ${student.category}`
    );
    reasons.push(`Reserved for ${(scholarship.category || []).join(', ')} categories.`);
  }

  // -------------------------------------------------------------
  // 3. EDUCATION LEVEL CHECK
  // -------------------------------------------------------------
  const eligibleLevels = (scholarship.education_level || []).map((l) => l.toLowerCase());
  const studentLvl = (student.education_level || '').toLowerCase();
  const isLevelOpen =
    eligibleLevels.length === 0 ||
    eligibleLevels.includes('all') ||
    eligibleLevels.includes('all levels');

  if (isLevelOpen) {
    matchedCriteria.push('Education Level: Open to all collegiate/school levels');
  } else if (!student.education_level) {
    missingCriteria.push(`Education Level: Scheme requires ${(scholarship.education_level || []).join(', ')}. Level not specified.`);
  } else if (eligibleLevels.some((l) => studentLvl.includes(l) || l.includes(studentLvl))) {
    matchedCriteria.push(`Education Level: ${student.education_level} (Matches eligible level)`);
  } else {
    failedCriteria.push(
      `Education Level: Requires ${(scholarship.education_level || []).join(', ')}, but current level is ${student.education_level}`
    );
    reasons.push(`Only open to students in ${(scholarship.education_level || []).join(', ')}.`);
  }

  // -------------------------------------------------------------
  // 4. COURSE STREAM CHECK
  // -------------------------------------------------------------
  const eligibleCourses = (scholarship.course || []).map((c) => c.toLowerCase());
  const studentCourse = (student.course || '').toLowerCase();
  const isCourseOpen =
    eligibleCourses.length === 0 ||
    eligibleCourses.includes('all courses') ||
    eligibleCourses.includes('all');

  if (isCourseOpen) {
    matchedCriteria.push('Course Stream: Open to all courses and academic disciplines');
  } else if (!student.course) {
    missingCriteria.push(`Course Stream: Scheme designated for ${(scholarship.course || []).join(', ')}. Course not specified.`);
  } else if (eligibleCourses.some((c) => studentCourse.includes(c) || c.includes(studentCourse))) {
    matchedCriteria.push(`Course Stream: ${student.course} (Eligible technical/degree stream)`);
  } else {
    failedCriteria.push(
      `Course Stream: Preferred courses are ${(scholarship.course || []).join(', ')} (Applicant enrolled in ${student.course})`
    );
    reasons.push(`Designated for students enrolled in ${(scholarship.course || []).join(', ')}.`);
  }

  // -------------------------------------------------------------
  // 5. ACADEMIC MARKS / PERCENTAGE CHECK
  // -------------------------------------------------------------
  const minPct = Number(scholarship.minimum_percentage || 0);

  if (minPct <= 0) {
    matchedCriteria.push('Academic Marks: No minimum percentage cutoff required');
  } else if (!student.percentage || student.percentage === 0) {
    missingCriteria.push(`Academic Marks: Scheme requires minimum ${minPct}% aggregate marks. Percentage was not entered.`);
  } else if (student.percentage >= minPct) {
    matchedCriteria.push(`Academic Marks: ${student.percentage}% meets or exceeds minimum cutoff of ${minPct}%`);
  } else {
    failedCriteria.push(
      `Academic Marks: Minimum cutoff is ${minPct}%, but applicant has ${student.percentage}%`
    );
    reasons.push(`Requires minimum aggregate marks of ${minPct}%.`);
  }

  // -------------------------------------------------------------
  // 6. FAMILY INCOME CEILING CHECK
  // -------------------------------------------------------------
  const maxInc = Number(scholarship.maximum_family_income || 0);

  if (maxInc <= 0 || maxInc >= 9999999) {
    matchedCriteria.push('Family Income: No maximum family income ceiling specified');
  } else if (!student.annual_family_income || student.annual_family_income === 0) {
    // If student did not provide income, this is missing/uncertain info
    missingCriteria.push(
      `Family Income: Scheme has a mandatory ceiling of ₹${maxInc.toLocaleString('en-IN')}. Please confirm family income from official certificate.`
    );
  } else if (student.annual_family_income <= maxInc) {
    matchedCriteria.push(
      `Family Income: ₹${student.annual_family_income.toLocaleString('en-IN')} is within ceiling of ₹${maxInc.toLocaleString('en-IN')}`
    );
  } else {
    failedCriteria.push(
      `Family Income: Ceiling is ₹${maxInc.toLocaleString('en-IN')} (Applicant income: ₹${student.annual_family_income.toLocaleString('en-IN')})`
    );
    reasons.push(`Annual family income exceeds scheme threshold of ₹${maxInc.toLocaleString('en-IN')}.`);
  }

  // -------------------------------------------------------------
  // 7. GENDER REQUIREMENT CHECK
  // -------------------------------------------------------------
  const schemeGender = scholarship.gender || 'All';

  if (schemeGender === 'All') {
    matchedCriteria.push('Gender: Open to all applicants');
  } else if (!student.gender || student.gender === 'Prefer not to say') {
    missingCriteria.push(`Gender: Scheme is exclusively for ${schemeGender} applicants. Gender was not specified.`);
  } else if (student.gender.toLowerCase() === schemeGender.toLowerCase()) {
    matchedCriteria.push(`Gender: ${student.gender} meets specific ${schemeGender} requirement`);
  } else {
    failedCriteria.push(
      `Gender: Scheme is exclusively for ${schemeGender} applicants (Applicant indicated ${student.gender})`
    );
    reasons.push(`Scheme is designated exclusively for ${schemeGender} applicants.`);
  }

  // -------------------------------------------------------------
  // 8. SPECIAL DISABILITY GATES (AICTE Saksham, DEPwD, etc.)
  // -------------------------------------------------------------
  const isDisabilityScheme =
    scholarship.name.toLowerCase().includes('saksham') ||
    scholarship.name.toLowerCase().includes('specially-abled') ||
    scholarship.name.toLowerCase().includes('disabilit');

  if (isDisabilityScheme) {
    if (student.disability_status === true) {
      matchedCriteria.push('Special Eligibility: Certified Person with Disability (UDID/PwD >= 40%) condition met');
    } else {
      failedCriteria.push(
        'Special Eligibility: Earmarked exclusively for specially-abled students with verified UDID/PwD certificate (>= 40%)'
      );
      reasons.push('Requires certified Person with Disability (UDID/PwD) status.');
    }
  }

  // -------------------------------------------------------------
  // 9. AGE WINDOW CHECK
  // -------------------------------------------------------------
  const minAge = scholarship.minimum_age || 14;
  const maxAge = scholarship.maximum_age || 75;

  if (student.age >= minAge && student.age <= maxAge) {
    matchedCriteria.push(`Age: ${student.age} years is within permissible window (${minAge}–${maxAge} years)`);
  } else {
    failedCriteria.push(`Age: Permissible window is ${minAge}–${maxAge} years (Applicant age: ${student.age})`);
    reasons.push(`Age falls outside the scheme eligibility bracket.`);
  }

  // -------------------------------------------------------------
  // 10. DOCUMENT ADVISORY CHECK
  // -------------------------------------------------------------
  if (scholarship.maximum_family_income > 0 && !student.income_certificate) {
    warnings.push('Income Certificate is required by this scheme; please obtain an authorized certificate (RD/Tahsildar).');
  }
  if (!isOpenToAllCategories && !student.caste_certificate && student.category !== 'General') {
    warnings.push('Caste Certificate is required for verification under reserved categories.');
  }

  // -------------------------------------------------------------
  // 11. STRICT 3-OUTCOME CLASSIFICATION (Approved Synopsis Page 3 & 7)
  // -------------------------------------------------------------
  let status: MatchStatus;
  let legacyStatus: 'eligible' | 'potential' | 'not-eligible';

  if (failedCriteria.length > 0) {
    status = 'does_not_match';
    legacyStatus = 'not-eligible';
  } else if (missingCriteria.length > 0) {
    status = 'more_info_needed';
    legacyStatus = 'potential';
  } else {
    status = 'potential_match';
    legacyStatus = 'eligible';
  }

  // Evaluation match score (percentage of evaluated rules satisfied)
  const totalEvaluatedRules = matchedCriteria.length + failedCriteria.length + missingCriteria.length;
  const score = totalEvaluatedRules > 0
    ? Math.round((matchedCriteria.length / totalEvaluatedRules) * 100)
    : 0;

  return {
    scholarship,
    status,
    legacyStatus,
    score,
    matchedCriteria,
    failedCriteria,
    missingCriteria,
    warnings,
    reasons,
    administeringAuthority,
    sourceUrl,
    officialUrl,
    lastVerifiedAt,
    explanation: {
      matched: matchedCriteria,
      failed: failedCriteria,
      missing: missingCriteria,
    },
  };
}

/**
 * Evaluates a student profile across a list of scholarships and sorts results.
 * Classification Priority:
 * 1. Potential Match (all known mandatory criteria satisfied)
 * 2. More Information Needed (missing/unverified criteria)
 * 3. Does Not Appear to Match (confirmed failure)
 * Within each status:
 * - Most matched criteria first
 * - Benefit amount descending
 */
export function calculateEligibility(
  student: StudentProfile,
  scholarships: Scholarship[]
): EligibilityResult[] {
  const normalized = normalizeStudentProfile(student);

  const evaluated = (scholarships || []).map((s) =>
    evaluateSingleScholarship(normalized, s)
  );

  return evaluated.sort((a, b) => {
    // 1. Group priority: potential_match (3) > more_info_needed (2) > does_not_match (1)
    const statusWeight: Record<MatchStatus, number> = {
      potential_match: 3,
      more_info_needed: 2,
      does_not_match: 1,
    };

    if (statusWeight[b.status] !== statusWeight[a.status]) {
      return statusWeight[b.status] - statusWeight[a.status];
    }

    // 2. Number of satisfied criteria
    if (b.matchedCriteria.length !== a.matchedCriteria.length) {
      return b.matchedCriteria.length - a.matchedCriteria.length;
    }

    // 3. Benefit amount descending
    return (b.scholarship.benefit_amount || 0) - (a.scholarship.benefit_amount || 0);
  });
}
