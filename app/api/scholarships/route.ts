import { NextResponse } from 'next/server';
import { getActiveScholarships, isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const scholarships = await getActiveScholarships();
    return NextResponse.json(scholarships, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch scholarships' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.provider) {
      return NextResponse.json({ error: 'Name and provider are required fields' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const adminClient: any = createAdminSupabaseClient() || supabase;
      const { data, error } = await adminClient
        .from('scholarships')
        .insert({
          ...body,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 201 });
    }

    return NextResponse.json({ success: true, scholarship: body }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing request' }, { status: 500 });
  }
}
