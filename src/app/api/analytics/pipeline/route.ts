import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define cache settings for the API route
export const dynamic = 'force-dynamic'; // Prevent static caching of the data

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // Allow authentication via Header or Query Parameter
    const authHeader = request.headers.get('x-pipeline-key');
    const queryKey = searchParams.get('key');
    const providedKey = authHeader || queryKey;
    
    const expectedKey = process.env.ANALYTICS_PIPELINE_KEY || 'privailers_data_secret_2026';

    if (!providedKey || providedKey !== expectedKey) {
        return NextResponse.json(
            { error: 'Unauthorized. Invalid or missing Pipeline Key.' }, 
            { status: 401 }
        );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Use the Service Role Key to bypass RLS for data extraction,
    // fallback to Anon Key (Note: Anon Key may be blocked by RLS from reading all user/lead data)
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
    });

    try {
        // Fetch all necessary tables concurrently
        // Note: For large datasets, pagination should be considered in the future
        const [usersRes, leadsRes, coursesRes, enrollmentsRes, projectsRes] = await Promise.all([
            supabase.from('users').select('id, email, full_name, role, created_at'),
            supabase.from('leads').select('*'),
            supabase.from('courses').select('*'),
            supabase.from('enrollments').select(`
                id, progress, status, enrolled_at, last_accessed, user_id, course_id,
                users (email, full_name),
                courses (title, price)
            `),
            supabase.from('projects').select('*')
        ]);

        // If using anon key and RLS blocks the query, it will throw an error or return empty
        if (usersRes.error) console.error("Users table error:", usersRes.error.message);
        if (leadsRes.error) console.error("Leads table error:", leadsRes.error.message);

        // Normalize data for Power BI (flattening nested relationships if needed, though Power BI handles JSON well)
        return NextResponse.json({
            metadata: {
                exported_at: new Date().toISOString(),
                record_counts: {
                    users: usersRes.data?.length || 0,
                    leads: leadsRes.data?.length || 0,
                    courses: coursesRes.data?.length || 0,
                    enrollments: enrollmentsRes.data?.length || 0,
                    projects: projectsRes.data?.length || 0
                },
                warning: (!process.env.SUPABASE_SERVICE_ROLE_KEY) ? "SUPABASE_SERVICE_ROLE_KEY is not set. Data may be incomplete due to RLS policies." : null
            },
            data: {
                users: usersRes.data || [],
                leads: leadsRes.data || [],
                courses: coursesRes.data || [],
                enrollments: enrollmentsRes.data || [],
                projects: projectsRes.data || []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to fetch analytics pipeline data' }, { status: 500 });
    }
}
