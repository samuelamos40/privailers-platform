import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const { fullName, email, password, adminCode } = await request.json();

        // Server-side master admin secret check
        // Can be set via environment variable ADMIN_REGISTRATION_SECRET or defaults to the platform secret
        const expectedCode = process.env.ADMIN_REGISTRATION_SECRET || 'PRIVAILERS_ADMIN_2026';

        if (!adminCode || adminCode !== expectedCode) {
            return NextResponse.json(
                { error: 'Invalid or unauthorized administrative registration code. Access denied.' },
                { status: 403 }
            );
        }

        if (!email || !password || password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters long and email is required.' },
                { status: 400 }
            );
        }

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceRoleKey || !supabaseUrl) {
            return NextResponse.json(
                { error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing.' },
                { status: 500 }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // 1. Create or invite user using Supabase Admin Auth API
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                role: 'admin'
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 2. Ensure public.users table has the admin role set
        if (authUser?.user) {
            await supabaseAdmin.from('users').upsert({
                id: authUser.user.id,
                email,
                full_name: fullName,
                role: 'admin',
                access_status: 'active',
                updated_at: new Date().toISOString()
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin account created and verified successfully.'
        });

    } catch (err: any) {
        console.error('Admin registration error:', err);
        return NextResponse.json(
            { error: err.message || 'An unexpected error occurred during admin registration.' },
            { status: 500 }
        );
    }
}
