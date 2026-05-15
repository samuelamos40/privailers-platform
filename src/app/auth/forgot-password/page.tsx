"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Redirect to the update-password page after clicking the email link
        // We assume the app is hosted at the origin, Supabase handles the domain.
        const redirectTo = typeof window !== 'undefined'
            ? `${window.location.origin}/auth/update-password`
            : undefined;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({
                type: 'success',
                text: 'Check your email! We sent you a password reset link.'
            });
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                backgroundColor: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Forgot Password?</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        borderRadius: '0.75rem',
                        backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: message.type === 'success' ? '#166534' : '#991b1b',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        lineHeight: 1.5
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleReset}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                border: '1px solid #cbd5e1',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <Button type="submit" disabled={loading} size="lg" style={{ width: '100%' }}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </Button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link href="/login" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
