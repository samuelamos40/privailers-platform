import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getLiveClassAnnouncementEmail } from '@/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_dummy_build_key');

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '').trim();
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (userErr || !user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const { data: profile } = await supabaseAdmin
            .from('users')
            .select('role, full_name')
            .eq('id', user.id)
            .maybeSingle();

        const role = (profile?.role || '').toLowerCase();
        if (role !== 'admin' && role !== 'instructor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const {
            audienceType,
            cohortId,
            courseId,
            sessionTitle,
            instructorName,
            scheduledAt,
            meetingUrl
        } = body;

        if (!sessionTitle || !scheduledAt) {
            return NextResponse.json({ error: 'Missing sessionTitle or scheduledAt.' }, { status: 400 });
        }

        let targetStudents: { full_name?: string; email?: string }[] = [];

        if (audienceType === 'general') {
            const { data: students } = await supabaseAdmin
                .from('users')
                .select('full_name, email')
                .eq('role', 'student');
            targetStudents = students || [];
        } else if (audienceType === 'cohort' && cohortId) {
            const { data: enrollments } = await supabaseAdmin
                .from('enrollments')
                .select('user:users(full_name, email)')
                .eq('cohort_id', cohortId)
                .eq('status', 'active');
            targetStudents = (enrollments || []).map((r: any) => r.user).filter(Boolean);
        } else if (audienceType === 'course' && courseId) {
            const { data: enrollments } = await supabaseAdmin
                .from('enrollments')
                .select('user:users(full_name, email)')
                .eq('course_id', courseId)
                .eq('status', 'active');
            targetStudents = (enrollments || []).map((r: any) => r.user).filter(Boolean);
        }

        // Deduplicate recipients by lowercase email
        const seen = new Set<string>();
        const uniqueRecipients = targetStudents.filter((s) => {
            const em = (s?.email || '').trim().toLowerCase();
            if (!em || seen.has(em)) return false;
            seen.add(em);
            return true;
        });

        if (uniqueRecipients.length === 0) {
            return NextResponse.json({ success: true, sentCount: 0 });
        }

        const fromAddress = process.env.EMAIL_FROM || 'Privailers Academy <info@privailers.com>';
        const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
        const resolvedInstructor = instructorName || profile?.full_name || 'Privailers Faculty';
        const resolvedUrl = meetingUrl || 'https://www.privailers.com/student/live-classes';

        const messages = uniqueRecipients.map((student) => {
            const emailContent = getLiveClassAnnouncementEmail({
                studentName: student.full_name || 'Student',
                sessionTitle,
                instructorName: resolvedInstructor,
                scheduledAt: formattedDate,
                meetingUrl: resolvedUrl
            });
            return {
                from: fromAddress,
                to: [student.email!.trim()],
                subject: emailContent.subject,
                html: emailContent.html
            };
        });

        // Send in batches of 100 via Resend batch API
        let sentCount = 0;
        for (let i = 0; i < messages.length; i += 100) {
            const chunk = messages.slice(i, i + 100);
            const result = await resend.batch.send(chunk);
            if (!result.error) {
                sentCount += chunk.length;
            } else {
                console.error('Resend batch error:', result.error);
            }
        }

        return NextResponse.json({ success: true, sentCount });
    } catch (err: any) {
        console.error('Live class notification error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
