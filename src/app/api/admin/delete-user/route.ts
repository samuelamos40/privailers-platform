import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
    try {
        const { userId, email } = await request.json();

        if (!userId && !email) {
            return NextResponse.json({ error: 'Missing userId or email parameter.' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return NextResponse.json({
                error: 'System misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing.'
            }, { status: 500 });
        }

        const supabase = createClient(
            supabaseUrl,
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

        // Get user email before deletion if not provided
        let targetEmail = email;
        if (userId && !targetEmail) {
            const { data: targetUser } = await supabase.from('users').select('email').eq('id', userId).single();
            if (targetUser?.email) targetEmail = targetUser.email;
        }

        // Clean up dependent records in public schema first
        if (userId) {
            await supabase.from('enrollments').delete().eq('user_id', userId);
            await supabase.from('submissions').delete().eq('student_id', userId);
            await supabase.from('users').delete().eq('id', userId);

            // Delete user from Supabase Auth by ID
            await supabase.auth.admin.deleteUser(userId);
        }

        // Also purge any matching user in auth.users by email to prevent orphaned auth accounts
        if (targetEmail) {
            const { data: authList } = await supabase.auth.admin.listUsers();
            const matchingAuth = authList?.users?.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());
            if (matchingAuth) {
                await supabase.auth.admin.deleteUser(matchingAuth.id);
            }
        }

        return NextResponse.json({ success: true, message: 'User account permanently deleted.' });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown server error occurred.' }, { status: 500 });
    }
}
