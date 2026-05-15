import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { email, full_name, password } = await request.json();

        // 1. Ensure Service Role Key exists
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return NextResponse.json({ 
                error: 'System misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing. Please add it to your .env.local file to use Admin API features.' 
            }, { status: 500 });
        }
        
        // Use the Service Role Key to bypass RLS and interact with the Admin Auth API
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // 2. Validate caller is an Admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header.' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid or expired authentication token.' }, { status: 401 });
        }

        // Check the database to ensure caller has 'admin' role
        const { data: adminCheck, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (roleError || adminCheck?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Only admins can create instructors natively.' }, { status: 403 });
        }

        // 3. Create Supabase Auth User
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // auto-confirm so they don't have to verify email to login
            user_metadata: { full_name }
        });

        if (createError) {
             return NextResponse.json({ error: `Supabase Auth Error: ${createError.message}` }, { status: 400 });
        }

        const newUserId = authData.user.id;

        // 4. Update the public.users table as instructor
        // Note: We use UPDATE because the database trigger 'on_auth_user_created' 
        // automatically inserts a row here as a 'student' when the auth user is created.
        const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'instructor' })
            .eq('id', newUserId);

        if (updateError) {
            // Rollback auth user creation if DB update fails
            await supabase.auth.admin.deleteUser(newUserId);
            return NextResponse.json({ error: `Database Update Error: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Instructor created successfully!' });

    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Unknown server error occurred.' }, { status: 500 });
    }
}
