'use client';

import React, { useState } from 'react';
import { StudentProfile } from '@/lib/supabase/types';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface EligibilityWizardProps {
  onEvaluate: (profile: StudentProfile) => void;
  isLoading?: boolean;
}

export default function EligibilityWizard({ onEvaluate, isLoading = false }: EligibilityWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<StudentProfile>({
    full_name: '',
    age: 20,
    gender: 'Male',
    state: 'Karnataka',
    district: '',
    education_level: 'Undergraduate',
    course: 'B.Tech/B.E',
    year_of_study: '2nd Year',
    percentage: 75,
    annual_family_income: 250000,
    category: 'General',
    income_certificate: true,
    caste_certificate: false,
    domicile_certificate: true,
    disability_status: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1-Click Sample Presets (Section 15 of prompt)
  const handleLoadSample = (preset: 'karnataka_obc' | 'sc_merit' | 'pragati_girl') => {
    if (preset === 'karnataka_obc') {
      setFormData({
        full_name: 'Rahul Gowda',
        age: 20,
        gender: 'Male',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        education_level: 'Undergraduate',
        course: 'B.Tech/B.E',
        year_of_study: '2nd Year',
        percentage: 78,
        annual_family_income: 250000,
        category: 'OBC',
        income_certificate: true,
        caste_certificate: true,
        domicile_certificate: true,
        disability_status: false,
      });
    } else if (preset === 'sc_merit') {
      setFormData({
        full_name: 'Ananya Solanki',
        age: 19,
        gender: 'Female',
        state: 'Maharashtra',
        district: 'Pune',
        education_level: 'Undergraduate',
        course: 'B.Sc Computer Science',
        year_of_study: '1st Year',
        percentage: 84,
        annual_family_income: 180000,
        category: 'SC',
        income_certificate: true,
        caste_certificate: true,
        domicile_certificate: true,
        disability_status: false,
      });
    } else if (preset === 'pragati_girl') {
      setFormData({
        full_name: 'Pooja Kulkarni',
        age: 21,
        gender: 'Female',
        state: 'Karnataka',
        district: 'Dharwad',
        education_level: 'Undergraduate',
        course: 'B.Tech/B.E',
        year_of_study: '3rd Year',
        percentage: 82,
        annual_family_income: 320000,
        category: 'General',
        income_certificate: true,
        caste_certificate: false,
        domicile_certificate: true,
        disability_status: false,
      });
    }
    setErrors({});
  };

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.full_name?.trim()) errs.full_name = 'Please enter your full name.';
      if (!formData.age || formData.age < 14 || formData.age > 75) errs.age = 'Please enter a valid student age between 14 and 75.';
      if (!formData.gender) errs.gender = 'Please select your gender.';
      if (!formData.state) errs.state = 'Please select your state of domicile.';
      if (!formData.district?.trim()) errs.district = 'Please enter your district.';
    } else if (currentStep === 2) {
      if (!formData.education_level) errs.education_level = 'Please select your education level.';
      if (!formData.course?.trim()) errs.course = 'Please enter your course (e.g. B.Tech, B.Sc).';
      if (!formData.year_of_study) errs.year_of_study = 'Please select your current year.';
      if (formData.percentage < 0 || formData.percentage > 100 || isNaN(formData.percentage)) {
        errs.percentage = 'Percentage must be between 0 and 100 (or CGPA between 0-10).';
      }
    } else if (currentStep === 3) {
      if (formData.annual_family_income < 0 || isNaN(formData.annual_family_income)) {
        errs.annual_family_income = 'Please enter annual family income (cannot be negative).';
      }
    } else if (currentStep === 4) {
      if (!formData.category) errs.category = 'Please select your social category.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(totalSteps, prev + 1));
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      onEvaluate(formData);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto">
      
      {/* Wizard Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Scholarship and Government Scheme Eligibility Checker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Rule-based preliminary screening against verified government scheme prerequisites. No account required.
            </p>
          </div>

          {/* Quick Sample Autoload Dropdown & Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadSample('karnataka_obc')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-primary hover:bg-blue-100 text-xs font-bold transition-all shadow-sm"
              title="Loads: 2nd Year UG B.Tech, 78%, ₹2,50,000, OBC, Karnataka"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              ⚡ Try Sample Profile
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 relative">
          {[
            { num: 1, title: 'Personal' },
            { num: 2, title: 'Academic' },
            { num: 3, title: 'Financial' },
            { num: 4, title: 'Category & Docs' }
          ].map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                type="button"
                key={s.num}
                onClick={() => (step > s.num ? setStep(s.num) : null)}
                className={`flex flex-col items-center text-center group ${
                  step > s.num ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all mb-1.5 ${
                    isActive
                      ? 'bg-primary text-white ring-4 ring-blue-100'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold ${
                    isActive ? 'text-primary font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        
        {/* STEP 1: PERSONAL INFORMATION */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">Step 1 — Personal Information</h3>
              <p className="text-xs text-slate-500">Demographic details required for age and state domicile rules.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Rahul Gowda"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.full_name && <p className="text-xs text-rose-600 mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="14"
                  max="75"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 20"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Needed for women-specific technical schemes.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State of Domicile <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Other State">Other State / UT</option>
                </select>
                {errors.state && <p className="text-xs text-rose-600 mt-1">{errors.state}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Bengaluru Urban, Pune, Mysuru"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.district && <p className="text-xs text-rose-600 mt-1">{errors.district}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ACADEMIC INFORMATION */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">Step 2 — Academic Information</h3>
              <p className="text-xs text-slate-500">Details about current collegiate enrollment and marks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Education Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.education_level}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="PUC / 12th">PUC / 12th Standard</option>
                  <option value="Diploma">Polytechnic / Diploma</option>
                  <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, B.Com, MBBS, etc.)</option>
                  <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MBA, etc.)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Stream <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="e.g. B.Tech/B.E, B.Sc, MBBS"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.course && <p className="text-xs text-rose-600 mt-1">{errors.course}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Year of Study <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.year_of_study}
                  onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="1st Year">1st Year / Fresh Admission</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year / Final Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qualifying Marks (% or CGPA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.percentage || ''}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 78 (or 8.2 for CGPA)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">CGPA (0-10) is converted automatically.</span>
                {errors.percentage && <p className="text-xs text-rose-600 mt-1">{errors.percentage}</p>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FINANCIAL INFORMATION */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">Step 3 — Family &amp; Financial Information</h3>
              <p className="text-xs text-slate-500">Economic indicators to match income limits and fee waivers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Annual Family Income (in ₹ INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.annual_family_income || ''}
                  onChange={(e) => setFormData({ ...formData, annual_family_income: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 250000"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">E.g., 250000 for ₹2.5 Lakhs/year.</span>
                {errors.annual_family_income && <p className="text-xs text-rose-600 mt-1">{errors.annual_family_income}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valid Income Certificate Available?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, income_certificate: true })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      formData.income_certificate
                        ? 'bg-blue-50 border-primary text-primary font-bold'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Yes, Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, income_certificate: false })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      !formData.income_certificate
                        ? 'bg-blue-50 border-primary text-primary font-bold'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    No / Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CATEGORY & DOCUMENTS */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">Step 4 — Social Category &amp; Document Readiness</h3>
              <p className="text-xs text-slate-500">Reservation quotas and essential document verification checklist.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Social Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="General">General / Open Merit</option>
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="Minority">Minority (Muslim, Christian, Sikh, Jain, etc.)</option>
                  <option value="EWS">EWS (Economically Weaker Section)</option>
                  <option value="Other">Other Category</option>
                </select>
                {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Caste Certificate Available?
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, caste_certificate: true })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      formData.caste_certificate
                        ? 'bg-blue-50 border-primary text-primary font-bold'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Yes, Available
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, caste_certificate: false })}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      !formData.caste_certificate
                        ? 'bg-blue-50 border-primary text-primary font-bold'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    No / Not Applicable
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.disability_status}
                    onChange={(e) => setFormData({ ...formData, disability_status: e.target.checked })}
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">Person with Benchmark Disability (PwD &ge; 40%)</span>
                    <span className="text-[11px] text-slate-500">Hold UDID or medical disability certificate (Required for AICTE Saksham scheme).</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}

          <div className="text-xs text-slate-400 font-semibold">
            Step {step} of {totalSteps}
          </div>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-75"
            >
              {isLoading ? 'Calculating Eligibility...' : 'Check My Eligibility 🚀'}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
