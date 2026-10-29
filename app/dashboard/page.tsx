'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { StudentProfile, Scholarship } from '@/lib/supabase/types';
import { getStudentProfile, getUserSavedScholarships, getActiveScholarships } from '@/lib/supabase/client';
import ScholarshipCard from '@/components/ScholarshipCard';
import ScholarshipModal from '@/components/ScholarshipModal';
import { User, Bookmark, Clock, RotateCcw, AlertCircle, LogIn } from 'lucide-react';

export default function DashboardPage() {
  const { user, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'reminders'>('profile');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [savedScholarships, setSavedScholarships] = useState<Scholarship[]>([]);
  const [allScholarships, setAllScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalScholarship, setActiveModalScholarship] = useState<Scholarship | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      const all = await getActiveScholarships();
      setAllScholarships(all);

      if (user?.id) {
        const prof = await getStudentProfile(user.id);
        setProfile(prof);
        const saved = await getUserSavedScholarships(user.id);
        setSavedScholarships(saved);
      } else {
        // Guest mode fallback
        if (typeof window !== 'undefined') {
          const rawProf = localStorage.getItem('scholarmatch_last_profile');
          if (rawProf) {
            try { setProfile(JSON.parse(rawProf)); } catch (e) {}
          }
          const savedGuest = await getUserSavedScholarships('');
          setSavedScholarships(savedGuest);
        }
      }
      setIsLoading(false);
    }

    loadDashboardData();
  }, [user]);

  // Deadlines calculation
  const sortedDeadlines = [...allScholarships]
    .filter(s => Boolean(s.application_end_date))
    .sort((a, b) => new Date(a.application_end_date!).getTime() - new Date(b.application_end_date!).getTime())
    .slice(0, 8);

  return (
    <div className="container-custom py-10 sm:py-14 space-y-8">
      
      {/* Header */}
      <div>
        <span className="section-tag">Student Central</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Student Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {user ? `Logged in as ${user.email}` : 'Guest Session (Login to sync your saved scholarships to Supabase)'}
        </p>
      </div>

      {/* Guest Notice Banner if not logged in */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <span>
              You are currently using <strong>Guest Mode</strong>. Your data is stored locally in your browser. Create a free account to sync your profile and saved scholarships across devices.
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In / Sign Up
          </Link>
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> My Profile
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'saved'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4" /> Saved Scholarships ({savedScholarships.length})
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'reminders'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Application Deadlines
        </button>
      </div>

      {/* TAB 1: PROFILE SNAPSHOT */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {profile ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{profile.full_name || 'Student Scholar'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profile.education_level} | {profile.course} ({profile.year_of_study}) • State: {profile.state}
                  </p>
                </div>
                <Link
                  href="/check"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-check / Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Category &amp; Domicile</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.category} ({profile.state})</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Academic Marks</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.percentage}% Aggregate</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Annual Family Income</span>
                  <span className="font-bold text-slate-800 text-sm">₹{Number(profile.annual_family_income).toLocaleString('en-IN')}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Income Certificate</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.income_certificate ? '✅ Available' : '❌ Pending'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Caste Certificate</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.caste_certificate ? '✅ Available' : '❌ Not Applicable'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Disability Status</span>
                  <span className="font-bold text-slate-800 text-sm">{profile.disability_status ? '✅ PwD (UDID >= 40%)' : 'None'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">No Profile Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Run an eligibility check to generate your profile snapshot and evaluate suitable scholarships.
              </p>
              <Link
                href="/check"
                className="inline-flex px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary-hover"
              >
                Check My Eligibility Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED SCHOLARSHIPS */}
      {activeTab === 'saved' && (
        <div>
          {savedScholarships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-base mb-1">No Saved Scholarships Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Click the bookmark icon on any scholarship card to save it for fast reference and reminders.
              </p>
              <Link
                href="/scholarships"
                className="inline-flex px-4 py-2 text-xs font-bold text-primary bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                Browse Scholarships Directory
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedScholarships.map(s => (
                <ScholarshipCard
                  key={s.id}
                  scholarship={s}
                  isSaved={true}
                  onViewDetails={setActiveModalScholarship}
                  onSaveToggle={(id, saved) => {
                    if (!saved) {
                      setSavedScholarships(prev => prev.filter(x => x.id !== id));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPLICATION DEADLINES */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">
            Upcoming Application Deadlines (Academic Year 2026-27)
          </h3>

          <div className="divide-y divide-slate-100">
            {sortedDeadlines.map((scheme) => {
              const daysLeft = Math.ceil((new Date(scheme.application_end_date!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysLeft <= 25 && daysLeft > 0;
              return (
                <div key={scheme.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{scheme.name}</h4>
                    <p className="text-slate-500">{scheme.provider}</p>
                  </div>

                  <div className="flex items-center gap-4 self-start sm:self-auto">
                    <div className="text-left sm:text-right">
                      <span className={`font-bold block ${isUrgent ? 'text-rose-600' : 'text-slate-700'}`}>
                        Closing: {scheme.application_end_date}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {daysLeft > 0 ? `${daysLeft} days remaining` : 'Closing soon'}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveModalScholarship(scheme)}
                      className="px-3 py-1.5 text-xs font-bold text-primary bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Modal */}
      <ScholarshipModal
        scholarship={activeModalScholarship}
        isOpen={Boolean(activeModalScholarship)}
        onClose={() => setActiveModalScholarship(null)}
      />

    </div>
  );
}
