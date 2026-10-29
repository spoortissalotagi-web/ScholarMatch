/**
 * ScholarMatch - Form Wizard & Validation Controller
 * Handles multi-step navigation, field validation, and sample profile presets.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FormWizard = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let currentStep = 1;
  const totalSteps = 4;

  // Sample Presets for demonstration
  const SAMPLE_PRESETS = {
    // Exact requested sample profile:
    // Education: Undergraduate, Year: 2nd Year, Percentage: 78%, Annual Income: ₹2,50,000, Category: OBC, State: Karnataka
    karnataka_obc: {
      name: 'Rahul Gowda',
      age: 20,
      gender: 'Male',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      dob: '2006-04-14',
      educationLevel: 'Undergraduate',
      course: 'B.Tech/B.E',
      yearOfStudy: '2nd Year',
      percentage: 78,
      collegeType: 'Government-Aided',
      income: 250000,
      hasIncomeCert: 'yes',
      familyMembers: 4,
      parentOccupation: 'Agriculture / Farming',
      category: 'OBC',
      hasCasteCert: 'yes',
      hasDisability: 'no',
      hasDomicileCert: 'yes',
      hasAadhaarBank: 'yes',
      regNumber: 'RD0038472910'
    },
    sc_merit: {
      name: 'Ananya Solanki',
      age: 19,
      gender: 'Female',
      state: 'Maharashtra',
      district: 'Pune',
      dob: '2007-06-22',
      educationLevel: 'Undergraduate',
      course: 'B.Sc Computer Science',
      yearOfStudy: '1st Year',
      percentage: 84,
      collegeType: 'Government',
      income: 180000,
      hasIncomeCert: 'yes',
      familyMembers: 5,
      parentOccupation: 'Daily Wage / Artisan',
      category: 'SC',
      hasCasteCert: 'yes',
      hasDisability: 'no',
      hasDomicileCert: 'yes',
      hasAadhaarBank: 'yes',
      regNumber: 'RD0092817342'
    },
    pragati_girl: {
      name: 'Pooja Kulkarni',
      age: 21,
      gender: 'Female',
      state: 'Karnataka',
      district: 'Dharwad',
      dob: '2005-09-10',
      educationLevel: 'Undergraduate',
      course: 'B.Tech/B.E',
      yearOfStudy: '3rd Year',
      percentage: 82,
      collegeType: 'Autonomous',
      income: 320000,
      hasIncomeCert: 'yes',
      familyMembers: 3,
      parentOccupation: 'Private Sector Employee',
      category: 'General',
      hasCasteCert: 'no',
      hasDisability: 'no',
      hasDomicileCert: 'yes',
      hasAadhaarBank: 'yes',
      regNumber: ''
    }
  };

  function init() {
    bindEvents();
    renderStep();
  }

  function bindEvents() {
    // Next / Prev buttons
    const btnNext = document.getElementById('wizard-btn-next');
    const btnPrev = document.getElementById('wizard-btn-prev');
    const btnSubmit = document.getElementById('wizard-btn-submit');
    const btnSample = document.getElementById('btn-try-sample');
    const presetSelect = document.getElementById('sample-preset-select');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
          goToStep(currentStep + 1);
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        goToStep(currentStep - 1);
      });
    }

    if (btnSubmit) {
      btnSubmit.addEventListener('click', handleFormSubmit);
    }

    if (btnSample) {
      btnSample.addEventListener('click', () => {
        const key = presetSelect ? presetSelect.value : 'karnataka_obc';
        loadSampleProfile(key);
      });
    }

    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        loadSampleProfile(e.target.value);
      });
    }

    // Direct click on step indicators
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach(ind => {
      ind.addEventListener('click', () => {
        const targetStep = parseInt(ind.getAttribute('data-step'), 10);
        // Only allow jumping back, or jumping forward if current step is valid
        if (targetStep < currentStep || validateStep(currentStep)) {
          goToStep(targetStep);
        }
      });
    });

    // Real-time error clearing on inputs
    const inputs = document.querySelectorAll('#eligibility-form input, #eligibility-form select');
    inputs.forEach(input => {
      input.addEventListener('input', () => clearFieldError(input));
      input.addEventListener('change', () => clearFieldError(input));
    });
  }

  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;
    renderStep();
    const wizardCard = document.querySelector('.wizard-card');
    if (wizardCard) {
      wizardCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderStep() {
    // Update Step Indicators
    for (let i = 1; i <= totalSteps; i++) {
      const ind = document.getElementById(`step-indicator-${i}`);
      const pane = document.getElementById(`form-step-${i}`);

      if (ind) {
        ind.classList.remove('active', 'completed');
        if (i === currentStep) {
          ind.classList.add('active');
        } else if (i < currentStep) {
          ind.classList.add('completed');
        }
      }

      if (pane) {
        pane.classList.toggle('active', i === currentStep);
      }
    }

    // Buttons visibility
    const btnPrev = document.getElementById('wizard-btn-prev');
    const btnNext = document.getElementById('wizard-btn-next');
    const btnSubmit = document.getElementById('wizard-btn-submit');
    const stepTracker = document.getElementById('step-tracker-text');

    if (btnPrev) {
      btnPrev.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    }

    if (btnNext) {
      btnNext.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
    }

    if (btnSubmit) {
      btnSubmit.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
    }

    if (stepTracker) {
      stepTracker.textContent = `Step ${currentStep} of ${totalSteps}`;
    }
  }

  // Field validation helper
  function setFieldError(fieldId, errorMsg) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const group = field.closest('.form-group') || field.parentElement;
    if (group) {
      group.classList.add('has-error');
      let errorEl = group.querySelector('.form-error-msg');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error-msg';
        group.appendChild(errorEl);
      }
      errorEl.textContent = errorMsg;
    }
    field.classList.add('is-invalid');
  }

  function clearFieldError(field) {
    if (!field) return;
    const group = field.closest('.form-group') || field.parentElement;
    if (group) {
      group.classList.remove('has-error');
      const err = group.querySelector('.form-error-msg');
      if (err) err.textContent = '';
    }
    field.classList.remove('is-invalid');
  }

  function validateStep(step) {
    let isValid = true;

    if (step === 1) {
      // Step 1: Personal Info
      const name = document.getElementById('field-name');
      const age = document.getElementById('field-age');
      const gender = document.getElementById('field-gender');
      const state = document.getElementById('field-state');
      const district = document.getElementById('field-district');

      if (!name || !name.value.trim()) {
        setFieldError('field-name', 'Please enter your full name.');
        isValid = false;
      }

      const ageVal = age ? parseInt(age.value, 10) : 0;
      if (!ageVal || ageVal < 14 || ageVal > 70) {
        setFieldError('field-age', 'Please enter a valid student age between 14 and 70.');
        isValid = false;
      }

      if (!gender || !gender.value) {
        setFieldError('field-gender', 'Please select your gender.');
        isValid = false;
      }

      if (!state || !state.value) {
        setFieldError('field-state', 'Please select your state of domicile.');
        isValid = false;
      }

      if (!district || !district.value.trim()) {
        setFieldError('field-district', 'Please enter your district name.');
        isValid = false;
      }
    } else if (step === 2) {
      // Step 2: Academic Info
      const eduLevel = document.getElementById('field-education-level');
      const course = document.getElementById('field-course');
      const year = document.getElementById('field-year-of-study');
      const percentage = document.getElementById('field-percentage');

      if (!eduLevel || !eduLevel.value) {
        setFieldError('field-education-level', 'Please select your current education level.');
        isValid = false;
      }

      if (!course || !course.value.trim()) {
        setFieldError('field-course', 'Please enter or select your course (e.g. B.Tech, B.Sc, Diploma).');
        isValid = false;
      }

      if (!year || !year.value) {
        setFieldError('field-year-of-study', 'Please select your current year of study.');
        isValid = false;
      }

      const pctVal = percentage ? parseFloat(percentage.value) : -1;
      if (isNaN(pctVal) || pctVal < 0 || pctVal > 100) {
        setFieldError('field-percentage', 'Please enter a valid percentage between 0 and 100 (or CGPA).');
        isValid = false;
      }
    } else if (step === 3) {
      // Step 3: Financial & Family
      const income = document.getElementById('field-annual-income');
      const incVal = income ? parseFloat(income.value) : -1;

      if (isNaN(incVal) || incVal < 0) {
        setFieldError('field-annual-income', 'Please enter your annual family income in Rupees (cannot be negative).');
        isValid = false;
      }
    } else if (step === 4) {
      // Step 4: Category & Docs
      const category = document.getElementById('field-category');
      if (!category || !category.value) {
        setFieldError('field-category', 'Please select your social category (General, OBC, SC, ST, Other).');
        isValid = false;
      }
    }

    return isValid;
  }

  function getFormData() {
    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };

    const isChecked = (name, valToCheck) => {
      const el = document.querySelector(`input[name="${name}"][value="${valToCheck}"]:checked`);
      return !!el;
    };

    const hasCheckbox = (id) => {
      const el = document.getElementById(id);
      return el ? el.checked : false;
    };

    return {
      name: val('field-name') || 'Student',
      age: parseInt(val('field-age'), 10) || 20,
      gender: val('field-gender') || 'Male',
      state: val('field-state') || 'Karnataka',
      district: val('field-district') || 'Bengaluru',
      dob: val('field-dob') || '',
      educationLevel: val('field-education-level') || 'Undergraduate',
      course: val('field-course') || 'B.Tech/B.E',
      yearOfStudy: val('field-year-of-study') || '2nd Year',
      percentage: parseFloat(val('field-percentage')) || 75,
      collegeType: val('field-college-type') || 'Government',
      income: parseFloat(val('field-annual-income')) || 250000,
      hasIncomeCert: isChecked('income-cert', 'yes'),
      familyMembers: parseInt(val('field-family-members'), 10) || 4,
      parentOccupation: val('field-parent-occupation') || '',
      category: val('field-category') || 'General',
      hasCasteCert: isChecked('caste-cert', 'yes'),
      hasDisability: hasCheckbox('field-disability'),
      hasDomicileCert: isChecked('domicile-cert', 'yes'),
      hasAadhaarBank: isChecked('aadhaar-bank', 'yes'),
      regNumber: val('field-reg-number') || ''
    };
  }

  function loadSampleProfile(presetKey) {
    const data = SAMPLE_PRESETS[presetKey] || SAMPLE_PRESETS.karnataka_obc;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    const setRadio = (name, val) => {
      const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
      if (el) el.checked = true;
    };

    const setCheck = (id, checked) => {
      const el = document.getElementById(id);
      if (el) el.checked = checked;
    };

    setVal('field-name', data.name);
    setVal('field-age', data.age);
    setVal('field-gender', data.gender);
    setVal('field-state', data.state);
    setVal('field-district', data.district);
    setVal('field-dob', data.dob);

    setVal('field-education-level', data.educationLevel);
    setVal('field-course', data.course);
    setVal('field-yearOfStudy', data.yearOfStudy);
    setVal('field-year-of-study', data.yearOfStudy);
    setVal('field-percentage', data.percentage);
    setVal('field-college-type', data.collegeType);

    setVal('field-annual-income', data.income);
    setRadio('income-cert', data.hasIncomeCert);
    setVal('field-family-members', data.familyMembers);
    setVal('field-parent-occupation', data.parentOccupation);

    setVal('field-category', data.category);
    setRadio('caste-cert', data.hasCasteCert);
    setCheck('field-disability', data.hasDisability === 'yes');
    setRadio('domicile-cert', data.hasDomicileCert);
    setRadio('aadhaar-bank', data.hasAadhaarBank);
    setVal('field-reg-number', data.regNumber);

    // Clear any active error states
    document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
    document.querySelectorAll('.form-control.is-invalid').forEach(f => f.classList.remove('is-invalid'));

    if (window.App && window.App.showToast) {
      window.App.showToast(`Loaded Sample Profile: ${data.name} (${data.category}, ${data.educationLevel}, ${data.percentage}%)`, 'success');
    }
  }

  async function handleFormSubmit(e) {
    if (e) e.preventDefault();

    if (!validateStep(currentStep)) return;

    const profile = getFormData();
    const btnSubmit = document.getElementById('wizard-btn-submit');
    const originalText = btnSubmit ? btnSubmit.innerHTML : 'Check My Eligibility';

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg> Evaluating Eligibility...
      `;
    }

    try {
      const results = await window.ScholarAPI.checkEligibility(profile);
      
      // Navigate to Results page and populate results
      if (window.App && window.App.navigateTo) {
        window.App.navigateTo('results');
        if (window.App.renderResults) {
          window.App.renderResults(results);
        }
        window.App.showToast(`Success! Found ${results.eligible} eligible schemes matching your criteria.`, 'success');
      }
    } catch (err) {
      console.error('Eligibility check error:', err);
      if (window.App && window.App.showToast) {
        window.App.showToast('Could not complete evaluation. Please check form entries.', 'error');
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
      }
    }
  }

  return {
    init,
    goToStep,
    loadSampleProfile,
    getFormData,
    SAMPLE_PRESETS
  };
}));
