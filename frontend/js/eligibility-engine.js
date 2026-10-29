/**
 * ScholarMatch - Core Eligibility Engine
 * Provides multi-factor weighted rule checking for student profiles against scholarship criteria.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js
    module.exports = factory();
  } else {
    // Browser global
    root.EligibilityEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Normalizes student profile fields
   */
  function normalizeProfile(raw) {
    const income = Number(raw.income || raw.annualIncome || 0);
    let percentage = Number(raw.percentage || 0);
    
    // If CGPA entered (e.g. <= 10), convert to percentage equivalent (standard CBSE/AICTE 9.5 multiplier)
    if (raw.cgpa && !raw.percentage) {
      percentage = Math.min(100, Math.round(Number(raw.cgpa) * 9.5 * 10) / 10);
    } else if (percentage > 0 && percentage <= 10) {
      // User entered CGPA in percentage box
      percentage = Math.min(100, Math.round(percentage * 9.5 * 10) / 10);
    }

    return {
      name: (raw.name || 'Student').trim(),
      age: Number(raw.age || 20),
      gender: raw.gender || 'All',
      state: (raw.state || '').trim(),
      district: (raw.district || '').trim(),
      dob: raw.dob || '',
      educationLevel: (raw.educationLevel || '').trim(),
      course: (raw.course || 'All Courses').trim(),
      yearOfStudy: (raw.yearOfStudy || '1st Year').trim(),
      percentage: Math.max(0, Math.min(100, percentage)),
      collegeType: raw.collegeType || 'Government',
      income: Math.max(0, income),
      hasIncomeCert: raw.hasIncomeCert === true || raw.hasIncomeCert === 'yes' || raw.hasIncomeCert === 'Yes',
      familyMembers: Number(raw.familyMembers || 4),
      parentOccupation: raw.parentOccupation || '',
      category: (raw.category || 'General').trim(),
      hasCasteCert: raw.hasCasteCert === true || raw.hasCasteCert === 'yes' || raw.hasCasteCert === 'Yes',
      hasDisability: raw.hasDisability === true || raw.hasDisability === 'yes' || raw.hasDisability === 'Yes',
      hasDomicileCert: raw.hasDomicileCert === true || raw.hasDomicileCert === 'yes' || raw.hasDomicileCert === 'Yes',
      hasAadhaarBank: raw.hasAadhaarBank === true || raw.hasAadhaarBank === 'yes' || raw.hasAadhaarBank === 'Yes',
      regNumber: raw.regNumber || ''
    };
  }

  /**
   * Core algorithm: checkEligibility
   * Evaluates a single student against a scholarship scheme.
   *
   * Scoring Breakdown (Total 100):
   * - Income Match: 25 points
   * - Category Match: 20 points
   * - Education Level & Course Match: 20 points (15 lvl + 5 crs)
   * - Academic Percentage Match: 20 points
   * - State / Domicile Match: 15 points
   *
   * @param {Object} studentProfile 
   * @param {Object} scheme 
   * @returns {Object} { eligible, isPotential, status, score, matchedCriteria, failedCriteria, warnings, reasons }
   */
  function checkEligibility(studentProfile, scheme) {
    const student = normalizeProfile(studentProfile);
    let score = 0;
    const matchedCriteria = [];
    const failedCriteria = [];
    const warnings = [];
    const reasons = [];
    let hardDisqualified = false;

    // ==========================================
    // 1. HARD GATE: GENDER RESTRICTIONS
    // ==========================================
    if (scheme.genderEligibility && scheme.genderEligibility !== 'All') {
      if (student.gender && student.gender !== 'Prefer not to say' && student.gender !== scheme.genderEligibility) {
        hardDisqualified = true;
        failedCriteria.push(`Exclusively for ${scheme.genderEligibility} applicants`);
        reasons.push(`Scheme is specifically reserved for ${scheme.genderEligibility} students.`);
      } else {
        matchedCriteria.push(`Gender eligibility (${scheme.genderEligibility}) satisfied`);
      }
    }

    // ==========================================
    // 2. HARD GATE: DISABILITY / PwD SPECIFIC
    // ==========================================
    if (scheme.requiresDisability) {
      if (!student.hasDisability) {
        hardDisqualified = true;
        failedCriteria.push('Requires Person with Disability (PwD >= 40%) certificate');
        reasons.push('Scheme is earmarked exclusively for specially-abled students with UDID/PwD certificate.');
      } else {
        matchedCriteria.push('PwD / Specially-abled criteria satisfied');
      }
    }

    // ==========================================
    // 3. FACTOR 1: FAMILY INCOME (25 POINTS)
    // ==========================================
    const maxInc = scheme.maxIncome || 0;
    if (maxInc <= 0 || maxInc >= 9999999) {
      // No income cap
      score += 25;
      matchedCriteria.push('No income limit (Open to all income brackets)');
    } else if (student.income <= maxInc) {
      score += 25;
      matchedCriteria.push(`Income ₹${student.income.toLocaleString('en-IN')} is within ceiling (₹${maxInc.toLocaleString('en-IN')})`);
    } else if (student.income <= maxInc * 1.15) {
      score += 12;
      warnings.push(`Annual income slightly exceeds limit by ₹${(student.income - maxInc).toLocaleString('en-IN')}`);
      reasons.push(`Income (₹${student.income.toLocaleString('en-IN')}) is near the maximum permissible limit of ₹${maxInc.toLocaleString('en-IN')}.`);
    } else {
      failedCriteria.push(`Income exceeds limit: ₹${student.income.toLocaleString('en-IN')} vs max ₹${maxInc.toLocaleString('en-IN')}`);
      reasons.push(`Family income exceeds the scheme cap of ₹${maxInc.toLocaleString('en-IN')}.`);
    }

    // ==========================================
    // 4. FACTOR 2: SOCIAL CATEGORY (20 POINTS)
    // ==========================================
    const eligibleCats = (scheme.eligibleCategories || []).map(c => c.toLowerCase());
    const studentCat = student.category.toLowerCase();
    const isAllCat = eligibleCats.includes('all') || eligibleCats.includes('general') && eligibleCats.includes('obc') && eligibleCats.includes('sc') && eligibleCats.includes('st');

    if (isAllCat || eligibleCats.includes(studentCat) || (studentCat === 'other' && eligibleCats.includes('other'))) {
      score += 20;
      matchedCriteria.push(`Category '${student.category}' is eligible`);
    } else {
      failedCriteria.push(`Category '${student.category}' not covered (Requires: ${scheme.eligibleCategories.join(', ')})`);
      reasons.push(`Scheme is designated for ${scheme.eligibleCategories.join(', ')} categories.`);
    }

    // ==========================================
    // 5. FACTOR 3: EDUCATION LEVEL & COURSE (20 POINTS)
    // ==========================================
    const eligibleLevels = (scheme.eligibleEducationLevels || []).map(l => l.toLowerCase());
    const studentLevel = student.educationLevel.toLowerCase();

    // 15 pts for education level
    if (eligibleLevels.length === 0 || eligibleLevels.includes('all') || eligibleLevels.some(l => studentLevel.includes(l) || l.includes(studentLevel))) {
      score += 15;
      matchedCriteria.push(`Education level '${student.educationLevel}' matches`);
    } else {
      failedCriteria.push(`Requires level: ${scheme.eligibleEducationLevels.join(' / ')}`);
      reasons.push(`Eligible for ${scheme.eligibleEducationLevels.join(', ')} students only.`);
    }

    // 5 pts for course
    const eligibleCourses = (scheme.eligibleCourses || []).map(c => c.toLowerCase());
    const studentCourse = student.course.toLowerCase();
    if (eligibleCourses.length === 0 || eligibleCourses.includes('all courses') || eligibleCourses.some(c => studentCourse.includes(c) || c.includes(studentCourse))) {
      score += 5;
      matchedCriteria.push(`Course '${student.course}' eligible`);
    } else {
      warnings.push(`Course specific scheme: Preferred courses include ${scheme.eligibleCourses.join(', ')}`);
    }

    // ==========================================
    // 6. FACTOR 4: ACADEMIC PERCENTAGE (20 POINTS)
    // ==========================================
    const minPct = scheme.minPercentage || 0;
    if (student.percentage >= minPct) {
      score += 20;
      matchedCriteria.push(`Marks ${student.percentage}% meets/exceeds requirement (${minPct}%)`);
    } else if (student.percentage >= minPct - 5) {
      score += 10;
      warnings.push(`Percentage ${student.percentage}% is close to cut-off of ${minPct}%`);
      reasons.push(`Academic score is slightly below the preferred ${minPct}% cutoff.`);
    } else {
      failedCriteria.push(`Academic marks ${student.percentage}% below required ${minPct}%`);
      reasons.push(`Requires a minimum of ${minPct}% in qualifying exams.`);
    }

    // ==========================================
    // 7. FACTOR 5: STATE / DOMICILE (15 POINTS)
    // ==========================================
    const schemeState = (scheme.state || 'All India').trim();
    if (schemeState.toLowerCase() === 'all india' || schemeState.toLowerCase() === 'central' || !schemeState) {
      score += 15;
      matchedCriteria.push('Pan-India eligibility (Students from all States/UTs welcome)');
    } else if (schemeState.toLowerCase() === student.state.toLowerCase()) {
      score += 15;
      matchedCriteria.push(`State domicile matched (${scheme.state})`);
    } else {
      failedCriteria.push(`State restricted: Domicile of ${scheme.state} required (Selected: ${student.state || 'None'})`);
      reasons.push(`This is a state-specific scheme for permanent residents of ${scheme.state}.`);
    }

    // ==========================================
    // 8. DOCUMENT READINESS CHECKS (Advisory)
    // ==========================================
    if (scheme.requiresIncomeCert && !student.hasIncomeCert) {
      warnings.push('Valid Income Certificate will be required during official document verification.');
    }
    if (scheme.requiresCasteCert && !student.hasCasteCert && student.category !== 'General') {
      warnings.push('Caste Certificate will be required at time of application submission.');
    }
    if (scheme.requiresDomicileCert && !student.hasDomicileCert && schemeState.toLowerCase() !== 'all india') {
      warnings.push('Domicile certificate of the state is required.');
    }
    if (!student.hasAadhaarBank) {
      warnings.push('Bank account must be seeded with Aadhaar for Direct Benefit Transfer (DBT).');
    }

    // ==========================================
    // 9. FINAL CLASSIFICATION & RESULT
    // ==========================================
    if (hardDisqualified) {
      score = Math.min(score, 40);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let status = 'not-eligible';
    let eligible = false;
    let isPotential = false;

    if (!hardDisqualified && score >= 75) {
      status = 'eligible';
      eligible = true;
    } else if (!hardDisqualified && score >= 50) {
      status = 'potential';
      isPotential = true;
    } else {
      status = 'not-eligible';
    }

    let matchSummary = '';
    if (status === 'eligible') {
      matchSummary = `Excellent match! You satisfy ${matchedCriteria.length} key eligibility criteria for this scheme.`;
    } else if (status === 'potential') {
      matchSummary = 'You may qualify with conditional criteria or relaxation. Please review the criteria below.';
    } else {
      matchSummary = reasons[0] || 'You do not currently satisfy the minimum qualifying prerequisites for this scheme.';
    }

    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      eligible,
      isPotential,
      status, // 'eligible' | 'potential' | 'not-eligible'
      score,
      matchedCriteria,
      failedCriteria,
      warnings,
      reasons,
      matchSummary
    };
  }

  /**
   * Batch evaluate a student profile across an entire scheme catalog
   */
  function evaluateAll(studentProfile, schemes) {
    if (!Array.isArray(schemes)) return [];

    return schemes.map(scheme => {
      const matchResult = checkEligibility(studentProfile, scheme);
      return {
        scheme,
        matchResult
      };
    }).sort((a, b) => {
      // Sort by score desc, then by benefitAmount desc
      if (b.matchResult.score !== a.matchResult.score) {
        return b.matchResult.score - a.matchResult.score;
      }
      return (b.scheme.benefitAmount || 0) - (a.scheme.benefitAmount || 0);
    });
  }

  return {
    normalizeProfile,
    checkEligibility,
    evaluateAll
  };
}));
