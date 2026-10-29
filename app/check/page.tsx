'use client';

import React, { useState, useEffect } from 'react';
import EligibilityWizard from '@/components/EligibilityWizard';
import ResultsDashboard from '@/components/ResultsDashboard';
import ScholarshipModal from '@/components/ScholarshipModal';
import { StudentProfile, Scholarship } from '@/lib/supabase/types';
import { EligibilityResult, calculateEligibility } from '@/lib/eligibilityEngine';
import { getActiveScholarships, saveStudentProfile, getUserSavedScholarships } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export default function CheckPage() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [results, setResults] = useState<EligibilityResult[] | null>(null);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalData, setActiveModalData] = useState<{ scholarship: Scholarship; result?: EligibilityResult } | null>(null);

  // Load scholarships & saved list on mount
  useEffect(() => {
    async function loadData() {
      const all = await getActiveScholarships();
      setScholarships(all);

      if (user?.id) {
        const saved = await getUserSavedScholarships(user.id);
        setSavedIds(saved.map(s => s.id));
      } else if (typeof window !== 'undefined') {
        const local = localStorage.getItem('saved_guest');
        if (local) {
          try {
            setSavedIds(JSON.parse(local));
          } catch (e) {}
        }
      }

      // Check if previous results exist in session
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('scholarmatch_last_results');
        const cachedProf = localStorage.getItem('scholarmatch_last_profile');
        if (cached && cachedProf) {
          try {
            setResults(JSON.parse(cached));
            setCurrentProfile(JSON.parse(cachedProf));
          } catch (e) {}
        }
      }
    }
    loadData();
  }, [user]);

  const handleEvaluate = async (profile: StudentProfile) => {
    setIsLoading(true);

    try {
      // 1. Fetch latest active scholarships from Supabase
      const allSchemes = await getActiveScholarships();
      setScholarships(allSchemes);

      // 2. Run TypeScript Eligibility Engine
      const evaluatedResults = calculateEligibility(profile, allSchemes);

      // 3. Update state
      setCurrentProfile(profile);
      setResults(evaluatedResults);

      // 4. Save to storage & Supabase
      if (typeof window !== 'undefined') {
        localStorage.setItem('scholarmatch_last_profile', JSON.stringify(profile));
        localStorage.setItem('scholarmatch_last_results', JSON.stringify(evaluatedResults));
      }

      if (user?.id) {
        await saveStudentProfile(user.id, profile);
      }

      // Scroll smoothly to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Eligibility evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToggle = (scholarshipId: string, newState: boolean) => {
    setSavedIds(prev => 
      newState ? [...prev, scholarshipId] : prev.filter(id => id !== scholarshipId)
    );
  };

  return (
    <div className="container-custom py-10 sm:py-14">
      {results && currentProfile ? (
        <ResultsDashboard
          results={results}
          profile={currentProfile}
          savedIds={savedIds}
          onEditProfile={() => setResults(null)}
          onViewDetails={(scholarship, result) => setActiveModalData({ scholarship, result })}
          onSaveToggle={handleSaveToggle}
        />
      ) : (
        <EligibilityWizard onEvaluate={handleEvaluate} isLoading={isLoading} />
      )}

      {/* Scholarship Deep-Dive Modal */}
      <ScholarshipModal
        scholarship={activeModalData?.scholarship || null}
        eligibilityResult={activeModalData?.result || null}
        isOpen={Boolean(activeModalData)}
        onClose={() => setActiveModalData(null)}
      />
    </div>
  );
}
