"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userProfile = await signIn(email, password);
            if (redirectTo) {
                router.push(redirectTo);
                return;
            }
            if (userProfile?.role === 'admin') {
                router.push('/admin');
            } else if (userProfile?.role === 'instructor') {
                router.push('/instructor');
            } else {
                router.push('/student');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
            <Card padding="lg" style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Student Login</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Access your courses and dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                        <Link href="/auth/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary-blue)', fontWeight: 500 }}>
                            Forgot Password?
                        </Link>
                    </div>

                    {error && (
                        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <Link href={redirectTo ? `/register?redirectTo=${encodeURIComponent(redirectTo)}` : "/register"} style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                        Sign Up
                    </Link>
                </div>
                    </Card>
                </div>
            );
        }

        export default function LoginPage() {
            return (
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginContent />
                </Suspense>
            );
        }
