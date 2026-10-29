import { NextResponse } from 'next/server';
import { getActiveScholarships } from '@/lib/supabase/client';
import { calculateEligibility, normalizeStudentProfile } from '@/lib/eligibilityEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profileData = body.profile || body;

    if (!profileData) {
      return NextResponse.json({ error: 'Student profile payload is required' }, { status: 400 });
    }

    const student = normalizeStudentProfile(profileData);
    const scholarships = await getActiveScholarships();

    const evaluated = calculateEligibility(student, scholarships);

    const summary = {
      total: evaluated.length,
      potentialMatches: evaluated.filter((r) => r.status === 'potential_match').length,
      moreInfoNeeded: evaluated.filter((r) => r.status === 'more_info_needed').length,
      doesNotMatch: evaluated.filter((r) => r.status === 'does_not_match').length,
      // Backward compatibility keys
      eligible: evaluated.filter((r) => r.status === 'potential_match').length,
      potential: evaluated.filter((r) => r.status === 'more_info_needed').length,
      notEligible: evaluated.filter((r) => r.status === 'does_not_match').length,
      profile: student,
      matches: evaluated,
      timestamp: new Date().toISOString(),
      disclaimer:
        'Preliminary eligibility results based on entered profile details. Official verification and final decision rests with the administering scheme authority.',
    };

    return NextResponse.json(summary, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error evaluating eligibility' },
      { status: 500 }
    );
  }
}
