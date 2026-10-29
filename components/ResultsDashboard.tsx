'use client';

import React, { useState, useMemo } from 'react';
import { Scholarship, StudentProfile } from '@/lib/supabase/types';
import { EligibilityResult, MatchStatus } from '@/lib/eligibilityEngine';
import ScholarshipCard from './ScholarshipCard';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Info,
  ShieldCheck,
  Building2,
  ArrowUpDown,
} from 'lucide-react';

interface ResultsDashboardProps {
  results: EligibilityResult[];
  profile: StudentProfile;
  savedIds: string[];
  onEditProfile: () => void;
  onViewDetails: (scholarship: Scholarship, result?: EligibilityResult) => void;
  onSaveToggle: (scholarshipId: string, newState: boolean) => void;
}

export default function ResultsDashboard({
  results,
  profile,
  savedIds,
  onEditProfile,
  onViewDetails,
  onSaveToggle,
}: ResultsDashboardProps) {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'potential_match' | 'more_info_needed' | 'does_not_match' | 'karnataka' | 'central'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'status' | 'highest-benefit' | 'deadline'>('status');

  // Exact 3-outcome synopsis counts
  const totalCount = results.length;
  const potentialCount = results.filter((r) => r.status === 'potential_match').length;
  const moreInfoCount = results.filter((r) => r.status === 'more_info_needed').length;
  const doesNotMatchCount = results.filter((r) => r.status === 'does_not_match').length;

  // Filtered and Sorted list
  const filteredResults = useMemo(() => {
    let list = [...results];

    // Status filter
    if (filterStatus === 'potential_match') {
      list = list.filter((r) => r.status === 'potential_match');
    } else if (filterStatus === 'more_info_needed') {
      list = list.filter((r) => r.status === 'more_info_needed');
    } else if (filterStatus === 'does_not_match') {
      list = list.filter((r) => r.status === 'does_not_match');
    } else if (filterStatus === 'karnataka') {
      list = list.filter((r) => (r.scholarship.state || '').toLowerCase() === 'karnataka');
    } else if (filterStatus === 'central') {
      list = list.filter(
        (r) =>
          (r.scholarship.state || '').toLowerCase() === 'all india' ||
          (r.scholarship.state || '').toLowerCase() === 'central'
      );
    }

    // Keyword search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.scholarship.name.toLowerCase().includes(q) ||
          (r.scholarship.administering_authority || r.scholarship.provider || '').toLowerCase().includes(q) ||
          (r.scholarship.category || []).some((c) => c.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'status') {
      const statusWeight: Record<MatchStatus, number> = {
        potential_match: 3,
        more_info_needed: 2,
        does_not_match: 1,
      };
      list.sort((a, b) => {
        if (statusWeight[b.status] !== statusWeight[a.status]) {
          return statusWeight[b.status] - statusWeight[a.status];
        }
        return (b.scholarship.benefit_amount || 0) - (a.scholarship.benefit_amount || 0);
      });
    } else if (sortBy === 'highest-benefit') {
      list.sort((a, b) => (b.scholarship.benefit_amount || 0) - (a.scholarship.benefit_amount || 0));
    } else if (sortBy === 'deadline') {
      list.sort((a, b) => {
        const d1 = a.scholarship.application_end_date
          ? new Date(a.scholarship.application_end_date).getTime()
          : 9999999999999;
        const d2 = b.scholarship.application_end_date
          ? new Date(b.scholarship.application_end_date).getTime()
          : 9999999999999;
        return d1 - d2;
      });
    }

    return list;
  }, [results, filterStatus, searchTerm, sortBy]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Preliminary Eligibility Evaluation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Found {potentialCount} Potential {potentialCount === 1 ? 'Scheme' : 'Schemes'} Matching Your Circumstances
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Evaluated for <strong>{profile.full_name || 'Applicant'}</strong> ({profile.education_level}, {profile.category}, {profile.percentage}% marks, State: {profile.state}, Annual Income: ₹{Number(profile.annual_family_income).toLocaleString('en-IN')}).
            </p>
          </div>
          <button
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Modify Profile
          </button>
        </div>

        {/* 3-Outcome Metric KPI Cards (Synopsis Alignment) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setFilterStatus('potential_match')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'potential_match'
                ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Potential Matches
              </span>
              <span className="text-2xl font-extrabold text-emerald-800">{potentialCount}</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              All evaluated mandatory criteria met. Ready to review and verify.
            </p>
          </div>

          <div
            onClick={() => setFilterStatus('more_info_needed')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'more_info_needed'
                ? 'bg-amber-50 border-amber-400 shadow-sm'
                : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                More Info Needed
              </span>
              <span className="text-2xl font-extrabold text-amber-800">{moreInfoCount}</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              Missing user inputs or unverified conditions requiring review.
            </p>
          </div>

          <div
            onClick={() => setFilterStatus('does_not_match')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              filterStatus === 'does_not_match'
                ? 'bg-slate-100 border-slate-400 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-500" />
                Does Not Appear to Match
              </span>
              <span className="text-2xl font-extrabold text-slate-700">{doesNotMatchCount}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              One or more confirmed mandatory conditions failed.
            </p>
          </div>
        </div>

        {/* Synopsis Official Notice Banner */}
        <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>
            <strong>Preliminary Screening Notice:</strong> This checker provides preliminary rule comparison based on entered details. It does not promise scholarship approval or make official decisions. Always verify latest circulars and submit on the official portal (NSP / SSP / myScheme).
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by scheme name or authority..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('potential_match')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'potential_match'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Potential Matches ({potentialCount})
          </button>
          <button
            onClick={() => setFilterStatus('more_info_needed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'more_info_needed'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            Needs More Info ({moreInfoCount})
          </button>
          <button
            onClick={() => setFilterStatus('karnataka')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'karnataka'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Karnataka SSP
          </button>
          <button
            onClick={() => setFilterStatus('central')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === 'central'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Central / NSP
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1 text-xs text-slate-500 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="border-none bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="status">Sort: Classification Status</option>
            <option value="highest-benefit">Sort: Highest Benefit</option>
            <option value="deadline">Sort: Application Deadline</option>
          </select>
        </div>
      </div>

      {/* Scholarship Cards Grid */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No schemes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No schemes match your active filter criteria. Try changing your filters or searching with different keywords.
          </p>
          <button
            onClick={() => {
              setFilterStatus('all');
              setSearchTerm('');
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResults.map((item) => (
            <ScholarshipCard
              key={item.scholarship.id}
              scholarship={item.scholarship}
              eligibilityResult={item}
              isSaved={savedIds.includes(item.scholarship.id)}
              onViewDetails={onViewDetails}
              onSaveToggle={onSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
