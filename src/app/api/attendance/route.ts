import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return null;
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

async function getAuthenticatedUser(request: Request, supabaseAdmin: any) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    if (!token) return null;
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

export async function POST(request: Request) {
    try {
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        const user = await getAuthenticatedUser(request, supabaseAdmin);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { classId } = await request.json();
        if (!classId) {
            return NextResponse.json({ error: 'Missing classId.' }, { status: 400 });
        }

        // Verify this is a cohort_classes session
        const { data: cohortClass } = await supabaseAdmin
            .from('cohort_classes')
            .select('id, cohort_id')
            .eq('id', classId)
            .maybeSingle();

        if (!cohortClass) {
            return NextResponse.json({ success: true, skipped: true });
        }

        // Only log attendance for students or users enrolled in this cohort
        const [{ data: profile }, { data: enrollment }] = await Promise.all([
            supabaseAdmin.from('users').select('role').eq('id', user.id).maybeSingle(),
            supabaseAdmin
                .from('enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('cohort_id', cohortClass.cohort_id)
                .maybeSingle()
        ]);

        const role = (profile?.role || '').toLowerCase();
        if (role !== 'student' && !enrollment) {
            return NextResponse.json({ success: true, skipped: true });
        }

        const { data: existing } = await supabaseAdmin
            .from('cohort_attendance')
            .select('id')
            .eq('class_id', classId)
            .eq('student_id', user.id)
            .maybeSingle();

        if (!existing) {
            const { error: insertErr } = await supabaseAdmin
                .from('cohort_attendance')
                .insert([{ class_id: classId, student_id: user.id }]);
            if (insertErr) {
                return NextResponse.json({ error: insertErr.message }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabaseAdmin = getAdminClient();
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        const user = await getAuthenticatedUser(request, supabaseAdmin);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const role = (profile?.role || '').toLowerCase();
        if (role !== 'admin' && role !== 'instructor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const classId = searchParams.get('classId');
        const cohortId = searchParams.get('cohortId');

        if (classId) {
            const { data, error } = await supabaseAdmin
                .from('cohort_attendance')
                .select('*, student:users(full_name, email)')
                .eq('class_id', classId)
                .order('joined_at', { ascending: true });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            return NextResponse.json({ attendance: data || [] });
        }

        if (cohortId) {
            const [{ data: students }, { data: cohortClasses }] = await Promise.all([
                supabaseAdmin
                    .from('enrollments')
                    .select('user_id, users(full_name, email)')
                    .eq('cohort_id', cohortId)
                    .eq('status', 'active'),
                supabaseAdmin
                    .from('cohort_classes')
                    .select('id')
                    .eq('cohort_id', cohortId)
            ]);

            const classIds = (cohortClasses || []).map((c: any) => c.id);
            let allAttendance: any[] = [];
            if (classIds.length > 0) {
                const { data: att } = await supabaseAdmin
                    .from('cohort_attendance')
                    .select('student_id, class_id')
                    .in('class_id', classIds);
                allAttendance = att || [];
            }

            const totalClasses = classIds.length;
            const summary = (students || []).map((s: any) => {
                const count = allAttendance.filter((a: any) => a.student_id === s.user_id).length;
                const percentage = totalClasses > 0 ? Math.round((count / totalClasses) * 100) : 0;
                return {
                    name: s.users?.full_name || 'Unknown',
                    email: s.users?.email || '',
                    attended: count,
                    total: totalClasses,
                    percentage
                };
            });

            return NextResponse.json({ summary });
        }

        return NextResponse.json({ error: 'Missing classId or cohortId.' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
