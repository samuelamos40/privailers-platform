import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400 });
        }

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return NextResponse.json({
                error: 'System misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing.'
            }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Validate caller is an Admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header.' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid or expired authentication token.' }, { status: 401 });
        }

        // Prevent admin from accidentally deleting their own account
        if (user.id === userId) {
            return NextResponse.json({ error: 'You cannot delete your own admin account.' }, { status: 400 });
        }

        const { data: adminCheck, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (roleError || adminCheck?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Only admins can delete user accounts.' }, { status: 403 });
        }

        // Clean up dependent records in public schema first
        await supabase.from('enrollments').delete().eq('user_id', userId);
        await supabase.from('submissions').delete().eq('student_id', userId);
        await supabase.from('users').delete().eq('id', userId);

        // Delete user from Supabase Auth
        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
        if (deleteAuthError && !deleteAuthError.message?.toLowerCase().includes('not found')) {
            return NextResponse.json({ error: `Auth Deletion Error: ${deleteAuthError.message}` }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'User account permanently deleted.' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown server error occurred.' }, { status: 500 });
    }
}
