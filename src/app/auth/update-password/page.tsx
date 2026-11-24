"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [sessionReady, setSessionReady] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        let active = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!active) return;
            if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                setSessionReady(true);
                setMessage(null);
                setVerifying(false);
            }
        });

        const initSession = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const tokenHash = params.get('token_hash');
                const type = params.get('type');
                const code = params.get('code');

                if (tokenHash && type === 'recovery') {
                    const { data, error } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: 'recovery'
                    });
                    if (!active) return;
                    if (error || !data.session) {
                        setMessage({ type: 'error', text: error?.message || 'Invalid or expired reset link. Please request a new one.' });
                    } else {
                        setSessionReady(true);
                    }
                    setVerifying(false);
                    return;
                }

                if (code) {
                    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                    if (!active) return;
                    if (error || !data.session) {
                        setMessage({ type: 'error', text: error?.message || 'Invalid or expired reset link. Please request a new one.' });
                    } else {
                        setSessionReady(true);
                    }
                    setVerifying(false);
                    return;
                }

                // Wait briefly for hash fragment processing if present
                await new Promise(r => setTimeout(r, 400));
                const { data: { session } } = await supabase.auth.getSession();
                if (!active) return;
                if (session) {
                    setSessionReady(true);
                } else {
                    setMessage({ type: 'error', text: 'Invalid or expired session. Please request a new password reset link.' });
                }
            } catch {
                if (active) {
                    setMessage({ type: 'error', text: 'Could not verify reset link. Please request a new one.' });
                }
            } finally {
                if (active) setVerifying(false);
            }
        };

        initSession();

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        } else {
            setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to login...' });
            await supabase.auth.signOut();
            setTimeout(() => {
                router.push('/login');
            }, 1800);
        }
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
                maxWidth: '420px',
                width: '100%',
                backgroundColor: 'white',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b' }}>Set New Password</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Please enter your new password below.
                    </p>
                </div>

                {verifying ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        Verifying reset link...
                    </div>
                ) : (
                    <>
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

                        {sessionReady ? (
                            <form onSubmit={handleUpdate}>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                        New Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.75rem',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <Button type="submit" disabled={loading} size="lg" style={{ width: '100%', justifyContent: 'center' }}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                <Link href="/auth/forgot-password" style={{ color: '#00a89c', fontWeight: 700, textDecoration: 'underline', fontSize: '0.95rem' }}>
                                    Request a New Password Reset Link →
                                </Link>
                            </div>
                        )}
                    </>
                )}

                <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
                    <Link href="/login" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
