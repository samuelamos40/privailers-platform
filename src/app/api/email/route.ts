import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_dummy_build_key');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, html } = body;

        if (!to || !subject || !html) {
            return NextResponse.json({ error: 'Missing required fields (to, subject, html)' }, { status: 400 });
        }

        // Note: Unless a custom domain is verified in Resend, 
        // 'onboarding@resend.dev' must be used as the from address,
        // and emails can only be sent to the email address used to create the Resend account.
        const fromAddress = process.env.EMAIL_FROM || 'Privailers Academy <onboarding@resend.dev>';

        const data = await resend.emails.send({
            from: fromAddress,
            to: [to],
            subject: subject,
            html: html,
        });

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Email send error:", error);
        return NextResponse.json({ error: error.message || 'Error sending email' }, { status: 500 });
    }
}
