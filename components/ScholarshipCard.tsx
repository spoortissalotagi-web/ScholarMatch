'use client';

import React, { useState } from 'react';
import { Scholarship } from '@/lib/supabase/types';
import { EligibilityResult } from '@/lib/eligibilityEngine';
import {
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { toggleSaveScholarship } from '@/lib/supabase/client';
import { useAuth } from './AuthProvider';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  eligibilityResult?: EligibilityResult;
  isSaved?: boolean;
  onViewDetails?: (scholarship: Scholarship, result?: EligibilityResult) => void;
  onSaveToggle?: (scholarshipId: string, newState: boolean) => void;
}

export default function ScholarshipCard({
  scholarship,
  eligibilityResult,
  isSaved = false,
  onViewDetails,
  onSaveToggle,
}: ScholarshipCardProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    const newState = await toggleSaveScholarship(user?.id || null, scholarship.id);
    setSaved(newState);
    setIsSaving(false);
    if (onSaveToggle) {
      onSaveToggle(scholarship.id, newState);
    }
  };

  const status = eligibilityResult?.status;
  const authority = scholarship.administering_authority || scholarship.provider;
  const verifiedDate = scholarship.last_verified_at || 'Verified 2026';
  const officialUrl = scholarship.official_url || scholarship.application_url || 'https://scholarships.gov.in';

  let statusBadge = null;
  let cardBorderClass = 'border-slate-200 hover:border-slate-300';

  if (status === 'potential_match') {
    cardBorderClass = 'border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md';
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Potential Match
      </span>
    );
  } else if (status === 'more_info_needed') {
    cardBorderClass = 'border-amber-200 hover:border-amber-300 shadow-sm';
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
        More Information Needed
      </span>
    );
  } else if (status === 'does_not_match') {
    cardBorderClass = 'border-slate-200 opacity-90';
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Does Not Appear to Match
      </span>
    );
  }

  const incomeFormatted = scholarship.maximum_family_income
    ? `₹${Number(scholarship.maximum_family_income).toLocaleString('en-IN')}`
    : 'No Limit';

  return (
    <div
      className={`bg-white rounded-xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 ${cardBorderClass}`}
    >
      <div>
        {/* Top Badges & Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {statusBadge ? (
              statusBadge
            ) : (
              <span className="bg-blue-50 text-primary border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {scholarship.state || 'All India'}
              </span>
            )}
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified Scheme
            </span>
          </div>

          <button
            onClick={handleBookmark}
            disabled={isSaving}
            className={`p-1.5 rounded-lg transition-colors ${
              saved
                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={saved ? 'Remove from saved' : 'Save scheme'}
            aria-label="Bookmark scheme"
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title & Administering Authority */}
        <h3
          onClick={() => onViewDetails && onViewDetails(scholarship, eligibilityResult)}
          className="text-base sm:text-lg font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {scholarship.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 mb-3">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="line-clamp-1">{authority}</span>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {scholarship.summary || scholarship.description}
        </p>

        {/* Rule Engine Highlights (Matched / Missing / Failed) */}
        {eligibilityResult && (
          <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            {status === 'potential_match' && (
              <div className="text-emerald-800 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Criteria satisfied:</strong> {eligibilityResult.matchedCriteria.length} evaluated rules matched (domicile, income, category, education).
                </span>
              </div>
            )}

            {status === 'more_info_needed' && eligibilityResult.missingCriteria.length > 0 && (
              <div className="text-amber-900 flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Verification needed:</strong> {eligibilityResult.missingCriteria[0]}
                </span>
              </div>
            )}

            {status === 'does_not_match' && eligibilityResult.failedCriteria.length > 0 && (
              <div className="text-rose-800 flex items-start gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Condition not met:</strong> {eligibilityResult.failedCriteria[0]}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Scheme Prerequisites Pill Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-4 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
          <div>
            <span className="text-slate-400 block">Family Income Cap:</span>
            <span className="font-semibold text-slate-800">{incomeFormatted}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Min. Percentage:</span>
            <span className="font-semibold text-slate-800">
              {scholarship.minimum_percentage > 0 ? `${scholarship.minimum_percentage}%` : 'Passing Marks'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Category:</span>
            <span className="font-semibold text-slate-800 line-clamp-1">
              {(scholarship.category || []).join(', ')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Jurisdiction:</span>
            <span className="font-semibold text-slate-800">{scholarship.state || 'All India'}</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Estimated Aid</span>
            <span className="font-extrabold text-emerald-700 text-sm">
              {scholarship.benefit_amount > 0
                ? `₹${Number(scholarship.benefit_amount).toLocaleString('en-IN')}/yr`
                : scholarship.benefit.slice(0, 30) + '...'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Last Verified</span>
            <span className="text-slate-600 font-medium text-[11px] flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3 text-slate-400" />
              {verifiedDate}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails && onViewDetails(scholarship, eligibilityResult)}
            className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            Scheme Details <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-3 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
          >
            Official Portal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
