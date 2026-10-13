import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceRoleKey || !supabaseUrl) {
            return NextResponse.json({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing.' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // 1. Check user token from header if available
        const authHeader = request.headers.get('authorization');
        let userId: string | null = null;

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '').trim();
            if (token) {
                const { data: { user } } = await supabaseAdmin.auth.getUser(token);
                if (user) userId = user.id;
            }
        }

        let enrolledCohortIds: string[] = [];
        let enrolledCourseIds: string[] = [];

        if (userId) {
            const { data: enrollments } = await supabaseAdmin
                .from('enrollments')
                .select('course_id, cohort_id, status, cohort:cohorts(course_id)')
                .eq('user_id', userId);

            if (enrollments) {
                enrollments.forEach((e: any) => {
                    if (e.cohort_id) enrolledCohortIds.push(e.cohort_id);
                    if (e.course_id) enrolledCourseIds.push(e.course_id);
                    if (e.cohort?.course_id) enrolledCourseIds.push(e.cohort.course_id);
                });
            }
        }

        // Deduplicate
        enrolledCohortIds = Array.from(new Set(enrolledCohortIds));
        enrolledCourseIds = Array.from(new Set(enrolledCourseIds));

        // 2. Fetch live_classes using service role (bypasses RLS block on general null course_id)
        const { data: rawLiveClasses, error: liveError } = await supabaseAdmin
            .from('live_classes')
            .select('*, course:courses(title), cohort:cohorts(name)')
            .in('status', ['scheduled', 'ongoing', 'live', 'completed'])
            .order('scheduled_at', { ascending: true });

        if (liveError) {
            console.error('Error fetching live classes:', liveError);
            return NextResponse.json({ error: liveError.message }, { status: 500 });
        }

        // 3. Filter live classes:
        // A student gets:
        // - All general sessions (course_id is null and cohort_id is null)
        // - Course sessions if enrolled in that course
        // - Cohort sessions if enrolled in that cohort
        const filteredLiveClasses = (rawLiveClasses || []).filter((cls: any) => {
            const isGeneral = !cls.course_id && !cls.cohort_id;
            if (isGeneral) return true;
            if (cls.cohort_id && enrolledCohortIds.includes(cls.cohort_id)) return true;
            if (cls.course_id && enrolledCourseIds.includes(cls.course_id)) return true;
            return false;
        }).map((cls: any) => ({
            ...cls,
            isGlobalLiveClass: true,
            isGeneralEvent: !cls.course_id && !cls.cohort_id,
            displayName: !cls.course_id && !cls.cohort_id
                ? 'Platform Masterclass / General Event'
                : cls.course?.title
                    ? `Course: ${cls.course.title}`
                    : cls.cohort?.name
                        ? `Cohort: ${cls.cohort.name}`
                        : 'Live Session'
        }));

        // 4. Fetch cohort_classes for enrolled cohorts
        let cohortClasses: any[] = [];
        if (enrolledCohortIds.length > 0) {
            const { data: rawCohortClasses } = await supabaseAdmin
                .from('cohort_classes')
                .select('*, cohort:cohorts(name)')
                .in('cohort_id', enrolledCohortIds)
                .in('status', ['scheduled', 'ongoing', 'live', 'completed'])
                .order('scheduled_at', { ascending: true });

            if (rawCohortClasses) {
                cohortClasses = rawCohortClasses.map((cls: any) => ({
                    ...cls,
                    classType: 'cohort',
                    isGeneralEvent: false,
                    displayName: cls.cohort?.name ? `Batch: ${cls.cohort.name}` : 'Mentored Cohort'
                }));
            }
        }

        // Combine and sort
        const combined = [...filteredLiveClasses, ...cohortClasses].sort(
            (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );

        // Identify any currently live or upcoming general events (for announcement notification banners)
        const now = Date.now();
        const generalAlerts = filteredLiveClasses.filter((cls: any) => {
            if (!cls.isGeneralEvent) return false;
            const scheduled = new Date(cls.scheduled_at).getTime();
            // Scheduled in next 72 hours, or ongoing/live, or scheduled today
            return cls.status === 'live' || cls.status === 'ongoing' || (cls.status === 'scheduled' && scheduled >= now - (2 * 3600 * 1000) && scheduled <= now + (72 * 3600 * 1000));
        });

        return NextResponse.json({
            classes: combined,
            generalAlerts,
            hasGeneralUpcoming: generalAlerts.length > 0
        });

    } catch (err: any) {
        console.error('Error in /api/student/live-classes:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
