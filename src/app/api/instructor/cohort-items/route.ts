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

async function authorizeStaff(request: Request, cohortId?: string | null) {
    const supabaseAdmin = getAdminClient();
    if (!supabaseAdmin) {
        return { error: NextResponse.json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 }) };
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    if (!token) {
        return { error: NextResponse.json({ error: 'Unauthorized: Missing access token.' }, { status: 401 }) };
    }

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) {
        return { error: NextResponse.json({ error: 'Unauthorized: Invalid session.' }, { status: 401 }) };
    }

    const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

    const role = (profile?.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'instructor') {
        return { error: NextResponse.json({ error: 'Forbidden: Admin or Instructor access required.' }, { status: 403 }) };
    }

    if (role === 'instructor' && cohortId) {
        const { data: cohort } = await supabaseAdmin
            .from('cohorts')
            .select('instructor_id')
            .eq('id', cohortId)
            .maybeSingle();
        if (!cohort || cohort.instructor_id !== user.id) {
            return { error: NextResponse.json({ error: 'Forbidden: You are not assigned to this cohort.' }, { status: 403 }) };
        }
    }

    return { supabaseAdmin, user, role };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { itemType, payload } = body;

        const cohortId = payload?.cohort_id || null;
        const auth = await authorizeStaff(request, cohortId);
        if ('error' in auth && auth.error) return auth.error;
        const { supabaseAdmin, role } = auth as { supabaseAdmin: any; role: string };

        if (itemType === 'resource') {
            if (!payload?.title || !payload?.file_url) {
                return NextResponse.json({ error: 'Title and file URL are required.' }, { status: 400 });
            }
            if (role === 'instructor' && !cohortId) {
                return NextResponse.json({ error: 'Instructors must select a cohort.' }, { status: 400 });
            }

            const insertRow: Record<string, any> = {
                title: payload.title,
                category: payload.category || 'Dataset',
                file_url: payload.file_url,
                file_size: payload.file_size || '',
                cohort_id: cohortId
            };

            const { data, error } = await supabaseAdmin.from('resources').insert([insertRow]).select().single();
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            return NextResponse.json({ success: true, data });
        }

        if (itemType === 'project') {
            if (!payload?.title) {
                return NextResponse.json({ error: 'Assignment title is required.' }, { status: 400 });
            }
            const insertRow: Record<string, any> = {
                title: payload.title,
                description: payload.description || '',
                due_date: payload.due_date || null,
                course_id: payload.course_id || null,
                cohort_id: cohortId
            };

            const { data, error } = await supabaseAdmin.from('projects').insert([insertRow]).select().single();
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json({ error: 'Unsupported itemType.' }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { itemType, id, cohortId } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing item id.' }, { status: 400 });
        }

        const auth = await authorizeStaff(request, cohortId || null);
        if ('error' in auth && auth.error) return auth.error;
        const { supabaseAdmin, user, role } = auth as { supabaseAdmin: any; user: any; role: string };

        const table = itemType === 'project' ? 'projects' : itemType === 'resource' ? 'resources' : null;
        if (!table) {
            return NextResponse.json({ error: 'Unsupported itemType.' }, { status: 400 });
        }

        if (role === 'instructor') {
            const { data: existing } = await supabaseAdmin
                .from(table)
                .select('cohort_id')
                .eq('id', id)
                .maybeSingle();
            if (!existing?.cohort_id) {
                return NextResponse.json({ error: 'Forbidden: Cannot delete non-cohort item.' }, { status: 403 });
            }
            const { data: cohort } = await supabaseAdmin
                .from('cohorts')
                .select('instructor_id')
                .eq('id', existing.cohort_id)
                .maybeSingle();
            if (!cohort || cohort.instructor_id !== user.id) {
                return NextResponse.json({ error: 'Forbidden: You are not assigned to this cohort.' }, { status: 403 });
            }
        }

        const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
