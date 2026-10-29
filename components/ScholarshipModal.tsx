'use client';

import React from 'react';
import { Scholarship } from '@/lib/supabase/types';
import { EligibilityResult } from '@/lib/eligibilityEngine';
import {
  X,
  ExternalLink,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck2,
  GraduationCap,
  IndianRupee,
  Info,
} from 'lucide-react';

interface ScholarshipModalProps {
  scholarship: Scholarship | null;
  eligibilityResult?: EligibilityResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ScholarshipModal({
  scholarship,
  eligibilityResult,
  isOpen,
  onClose,
}: ScholarshipModalProps) {
  if (!isOpen || !scholarship) return null;

  const authority = scholarship.administering_authority || scholarship.provider;
  const officialUrl = scholarship.official_url || scholarship.application_url || 'https://scholarships.gov.in';
  const verifiedDate = scholarship.last_verified_at || '2026-10-15';
  const sourcePortal = scholarship.source_url?.includes('karnataka')
    ? 'Karnataka State Scholarship Portal (SSP)'
    : scholarship.source_url?.includes('myscheme')
    ? 'myScheme National Platform'
    : 'National Scholarship Portal (NSP)';

  const incomeFormatted = scholarship.maximum_family_income
    ? `₹${Number(scholarship.maximum_family_income).toLocaleString('en-IN')}`
    : 'No Upper Ceiling';

  const defaultDocs = [
    'Annual Family Income Certificate issued by Revenue Authority',
    'Previous Qualifying Marksheet / Grade Transcript',
    'Aadhaar-Linked Bank Account Passbook Copy',
    'College Bonafide Student Certificate / Current Fee Receipt',
    'Caste / Category Certificate (if applying under reserved category)',
  ];

  const docs =
    scholarship.required_documents && scholarship.required_documents.length > 0
      ? scholarship.required_documents
      : defaultDocs;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-primary bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded">
                {scholarship.state || 'All India'}
              </span>
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified Government Scheme
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {scholarship.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{authority}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          
          {/* Rule Engine Evaluation Box if evaluated */}
          {eligibilityResult && (
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                eligibilityResult.status === 'potential_match'
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : eligibilityResult.status === 'more_info_needed'
                  ? 'bg-amber-50/80 border-amber-200'
                  : 'bg-rose-50/80 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                  {eligibilityResult.status === 'potential_match' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-900">Classification: Potential Match</span>
                    </>
                  )}
                  {eligibilityResult.status === 'more_info_needed' && (
                    <>
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-900">Classification: More Information Needed</span>
                    </>
                  )}
                  {eligibilityResult.status === 'does_not_match' && (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-900">Classification: Does Not Appear to Match</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {eligibilityResult.matchedCriteria.length} Conditions Satisfied
                </span>
              </div>

              {/* Matched Criteria */}
              {eligibilityResult.matchedCriteria.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800 block">Satisfied Criteria:</span>
                  <ul className="text-xs space-y-1 pl-4 list-disc text-slate-700">
                    {eligibilityResult.matchedCriteria.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Criteria */}
              {eligibilityResult.missingCriteria.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-amber-200/60">
                  <span className="text-xs font-bold text-amber-900 block flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline" />
                    Missing or Uncertain Information:
                  </span>
                  <ul className="text-xs space-y-1 pl-4 list-disc text-amber-800">
                    {eligibilityResult.missingCriteria.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Failed Criteria */}
              {eligibilityResult.failedCriteria.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-rose-200/60">
                  <span className="text-xs font-bold text-rose-900 block flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 inline" />
                    Unmatched Eligibility Conditions:
                  </span>
                  <ul className="text-xs space-y-1 pl-4 list-disc text-rose-800">
                    {eligibilityResult.failedCriteria.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Scheme Summary */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Scheme Summary
            </h4>
            <p className="text-slate-700 leading-relaxed text-sm">
              {scholarship.summary || scholarship.description}
            </p>
          </div>

          {/* Scheme Benefit */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              Benefit Details
            </h4>
            <p className="text-emerald-950 font-medium text-sm">
              {scholarship.benefit}
            </p>
          </div>

          {/* Key Eligibility Rules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              Official Eligibility Criteria
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Family Income Ceiling:</span>
                <strong className="text-slate-800 text-sm">{incomeFormatted}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Minimum Marks Cutoff:</span>
                <strong className="text-slate-800 text-sm">
                  {scholarship.minimum_percentage > 0 ? `${scholarship.minimum_percentage}% aggregate` : 'Passing marks'}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Eligible Social Categories:</span>
                <strong className="text-slate-800">{(scholarship.category || []).join(', ')}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block mb-0.5">Eligible Levels:</span>
                <strong className="text-slate-800">{(scholarship.education_level || []).join(', ')}</strong>
              </div>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              Commonly Required Documents
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <ul className="space-y-2 text-xs">
                {docs.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Verification & Official Source Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span><strong>Official Portal Source:</strong> {sourcePortal}</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3 h-3" /> Last Verified: {verifiedDate}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              <strong>Notice:</strong> This web application provides preliminary screening only. Final approval, quotas, and disbursement decisions rest entirely with the administering government authority.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors w-full sm:w-auto justify-center"
          >
            <Printer className="w-4 h-4" /> Print / Save Details
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex-1 sm:flex-initial"
            >
              Close
            </button>
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm flex-1 sm:flex-initial whitespace-nowrap"
            >
              Apply on Official Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
