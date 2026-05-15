import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { reference, courseId, userId, cohortId } = body;

        if (!reference || !userId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Verify with Paystack
        let isSuccess = false;

        if (process.env.PAYSTACK_SECRET_KEY?.includes('mock_paystack')) {
            console.log("Mock Paystack Verification Passed for ref:", reference);
            isSuccess = true;
        } else {
            const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            });

            const paystackData = await paystackResponse.json();
            if (paystackData.status && paystackData.data.status === 'success') {
                isSuccess = true;
            }
        }

        if (isSuccess) {
            // Check if enrollment exists (pending)
            const { data: existing } = await supabase
                .from('enrollments')
                .select('*')
                .eq('user_id', userId)
                .match(cohortId ? { cohort_id: cohortId } : { course_id: courseId })
                .single();

            if (existing) {
                await supabase.from('enrollments').update({ status: 'active' }).eq('id', existing.id);
            } else {
                await supabase.from('enrollments').insert([{
                    user_id: userId,
                    course_id: courseId || null,
                    cohort_id: cohortId || null,
                    status: 'active',
                    progress: 0
                }]);
            }

            return NextResponse.json({ success: true });
        }
 else {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Checkout verification error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
