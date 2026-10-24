import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getPaymentReceiptEmail } from '@/lib/emailTemplates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_dummy_build_key');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { reference, courseId, userId, cohortId } = body;

        if (!reference || !userId) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Verify with Paystack
        let isSuccess = false;
        let amountPaid = 0;
        let customerEmail = '';

        if (process.env.PAYSTACK_SECRET_KEY?.includes('mock_paystack')) {
            console.log("Mock Paystack Verification Passed for ref:", reference);
            isSuccess = true;
            amountPaid = 50000;
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
                // Paystack returns amount in kobo (1 NGN = 100 kobo)
                amountPaid = (paystackData.data.amount || 0) / 100;
                customerEmail = paystackData.data.customer?.email || '';
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

            // Attempt to send branded payment receipt email asynchronously
            try {
                // Fetch student and course metadata
                const { data: userProfile } = await supabase
                    .from('users')
                    .select('full_name, email')
                    .eq('id', userId)
                    .single();

                const studentEmail = userProfile?.email || customerEmail;
                const studentName = userProfile?.full_name || 'Valued Student';

                let itemName = 'Data Analytics Program';
                if (courseId) {
                    const { data: c } = await supabase.from('courses').select('title, price').eq('id', courseId).single();
                    if (c?.title) {
                        itemName = c.title;
                        if (!amountPaid && c.price) amountPaid = c.price;
                    }
                } else if (cohortId) {
                    const { data: co } = await supabase.from('cohorts').select('name').eq('id', cohortId).single();
                    if (co?.name) itemName = co.name;
                }

                if (studentEmail && process.env.RESEND_API_KEY) {
                    const fromAddress = process.env.EMAIL_FROM || 'Privailers Academy <onboarding@resend.dev>';
                    const emailTemplate = getPaymentReceiptEmail({
                        studentName,
                        courseName: itemName,
                        amountPaid: amountPaid || 0,
                        reference,
                        classroomUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://privailers.com'}/student/courses`
                    });

                    await resend.emails.send({
                        from: fromAddress,
                        to: [studentEmail],
                        subject: emailTemplate.subject,
                        html: emailTemplate.html,
                    });
                }
            } catch (emailErr) {
                // Fail gracefully so email delivery issues never interrupt enrollment activation
                console.error("Non-blocking receipt email dispatch error:", emailErr);
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Checkout verification error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
