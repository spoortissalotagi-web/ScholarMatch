'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Scholarship } from '@/lib/supabase/types';
import { getActiveScholarships, getUserSavedScholarships } from '@/lib/supabase/client';
import ScholarshipCard from '@/components/ScholarshipCard';
import ScholarshipModal from '@/components/ScholarshipModal';
import { useAuth } from '@/components/AuthProvider';
import { Search, Filter, Layers, BookOpen } from 'lucide-react';

export default function ScholarshipsPage() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEducation, setSelectedEducation] = useState('All');
  const [maxIncomeFilter, setMaxIncomeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'benefit' | 'deadline' | 'name'>('benefit');

  // Modal state
  const [modalScholarship, setModalScholarship] = useState<Scholarship | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const all = await getActiveScholarships();
      setScholarships(all);

      if (user?.id) {
        const saved = await getUserSavedScholarships(user.id);
        setSavedIds(saved.map(s => s.id));
      } else if (typeof window !== 'undefined') {
        const local = localStorage.getItem('saved_guest');
        if (local) {
          try { setSavedIds(JSON.parse(local)); } catch (e) {}
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [user]);

  // Dynamic filter options extracted from actual database records
  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    scholarships.forEach(s => {
      if (s.state) states.add(s.state);
    });
    return ['All', ...Array.from(states)];
  }, [scholarships]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    scholarships.forEach(s => {
      (s.category || []).forEach(c => cats.add(c));
    });
    return ['All', ...Array.from(cats)];
  }, [scholarships]);

  const uniqueEducationLevels = useMemo(() => {
    const levels = new Set<string>();
    scholarships.forEach(s => {
      (s.education_level || []).forEach(l => levels.add(l));
    });
    return ['All', ...Array.from(levels)];
  }, [scholarships]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    return scholarships
      .filter((s) => {
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = s.name.toLowerCase().includes(q);
          const matchProvider = (s.administering_authority || s.provider || '').toLowerCase().includes(q);
          const matchDesc = (s.summary || s.description || '').toLowerCase().includes(q);
          if (!matchName && !matchProvider && !matchDesc) return false;
        }

        // State filter
        if (selectedState !== 'All' && s.state !== selectedState && s.state !== 'All India') {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All') {
          const cats = (s.category || []).map(c => c.toLowerCase());
          if (!cats.includes('all') && !cats.includes(selectedCategory.toLowerCase())) {
            return false;
          }
        }

        // Education Level filter
        if (selectedEducation !== 'All') {
          const levels = (s.education_level || []).map(l => l.toLowerCase());
          if (!levels.includes('all') && !levels.includes(selectedEducation.toLowerCase())) {
            return false;
          }
        }

        // Max Income filter
        if (maxIncomeFilter !== 'All') {
          const limit = parseFloat(maxIncomeFilter);
          if (s.maximum_family_income > 0 && s.maximum_family_income < limit) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'benefit') {
          return (b.benefit_amount || 0) - (a.benefit_amount || 0);
        } else if (sortBy === 'deadline') {
          const d1 = a.application_end_date ? new Date(a.application_end_date).getTime() : 9999999999999;
          const d2 = b.application_end_date ? new Date(b.application_end_date).getTime() : 9999999999999;
          return d1 - d2;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  }, [scholarships, searchTerm, selectedState, selectedCategory, selectedEducation, maxIncomeFilter, sortBy]);

  return (
    <div className="container-custom py-10 sm:py-14 space-y-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="section-tag">Database Directory</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Explore Government Schemes &amp; Scholarships
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Browse verified schemes retrieved dynamically from the Supabase database. Filter by state, category, or academic level.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scholarships, schemes or issuing ministries..."
            className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Dynamic Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
          {/* State */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">State / Domicile</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-medium"
            >
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Social Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-medium"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Education Level</label>
            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-medium"
            >
              {uniqueEducationLevels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>

          {/* Income Ceiling */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Min Income Cap</label>
            <select
              value={maxIncomeFilter}
              onChange={(e) => setMaxIncomeFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Incomes</option>
              <option value="250000">&ge; ₹2.5 Lakhs</option>
              <option value="450000">&ge; ₹4.5 Lakhs</option>
              <option value="800000">&ge; ₹8.0 Lakhs</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-medium"
            >
              <option value="benefit">Highest Benefit Amount</option>
              <option value="deadline">Application Deadline</option>
              <option value="name">Scheme Name (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>Showing {filteredList.length} of {scholarships.length} active scholarships</span>
        {(searchTerm || selectedState !== 'All' || selectedCategory !== 'All' || selectedEducation !== 'All' || maxIncomeFilter !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedState('All');
              setSelectedCategory('All');
              setSelectedEducation('All');
              setMaxIncomeFilter('All');
            }}
            className="text-primary hover:underline font-bold"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base mb-1">No Scholarships Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredList.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              isSaved={savedIds.includes(scholarship.id)}
              onViewDetails={(s) => setModalScholarship(s)}
              onSaveToggle={(id, saved) => {
                setSavedIds(prev => saved ? [...prev, id] : prev.filter(x => x !== id));
              }}
            />
          ))}
        </div>
      )}

      {/* Detailed Modal */}
      <ScholarshipModal
        scholarship={modalScholarship}
        isOpen={Boolean(modalScholarship)}
        onClose={() => setModalScholarship(null)}
      />

    </div>
  );
}
