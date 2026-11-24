import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123_dummy_build_key');

export async function POST(request: Request) {
    try {
        const { email, origin } = await request.json();
        const trimmedEmail = (email || '').trim().toLowerCase();

        if (!trimmedEmail) {
            return NextResponse.json({ error: 'Please enter your email address.' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const baseUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.privailers.com';
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: trimmedEmail,
            options: {
                redirectTo: `${baseUrl}/auth/update-password`
            }
        });

        if (error) {
            // Avoid leaking whether an email exists if user not found, or surface clear message
            if (error.message?.toLowerCase().includes('not found')) {
                return NextResponse.json({
                    success: true,
                    message: 'If an account exists for that email, we have sent a password reset link.'
                });
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const hashedToken = data?.properties?.hashed_token;
        const resetUrl = hashedToken
            ? `${baseUrl}/auth/update-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
            : data?.properties?.action_link;

        if (!resetUrl) {
            return NextResponse.json({ error: 'Could not generate reset link.' }, { status: 500 });
        }

        const fromAddress = process.env.EMAIL_FROM || 'Privailers Academy <info@privailers.com>';
        const emailResult = await resend.emails.send({
            from: fromAddress,
            to: [trimmedEmail],
            subject: 'Reset Your Privailers Password',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc;">
                    <div style="background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <div style="background-color: #061e48; padding: 28px 32px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Privailers Data Consult</h1>
                            <p style="color: #00a89c; margin: 6px 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Password Reset Request</p>
                        </div>
                        <div style="padding: 32px;">
                            <h2 style="margin: 0 0 12px; color: #061e48; font-size: 20px;">Reset Your Password</h2>
                            <p style="margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.6;">
                                We received a request to reset the password for your Privailers account. Click the button below to choose a new password:
                            </p>
                            <div style="text-align: center; margin-bottom: 24px;">
                                <a href="${resetUrl}" style="display: inline-block; background-color: #00a89c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px;">
                                    Set New Password →
                                </a>
                            </div>
                            <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                                If you did not request a password reset, you can safely ignore this email.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        if (emailResult.error) {
            return NextResponse.json({ error: emailResult.error.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Check your email! We sent you a password reset link (check Spam/Promotions if not in Primary).'
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Error sending password reset email.' }, { status: 500 });
    }
}
