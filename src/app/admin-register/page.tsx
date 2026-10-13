"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function AdminRegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        adminCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.adminCode.trim()) {
            setError('Administrative authorization code is required.');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Verify and create admin securely on the server
            const res = await fetch('/api/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    adminCode: formData.adminCode
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Admin registration failed.');
            }

            alert('Admin account created successfully! You can now log in.');
            router.push('/admin-login');

        } catch (err: any) {
            setError(err.message || 'Registration failed. Please check your authorization code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '2rem' }}>
            <Card padding="lg" style={{ maxWidth: '480px', width: '100%', border: '1px solid #334155', backgroundColor: '#1e293b' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', marginBottom: '1rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Admin Access Portal</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Restricted access for platform administrators</p>
                </div>

                <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.813rem', color: '#fef08a', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔒</span>
                    <div>
                        <strong>Authorization Required:</strong> Registration is restricted to authorized personnel with a confidential security passphrase provided by platform leadership.
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Full Name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Admin Full Name"
                        required
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="admin@privailers.com"
                        required
                    />
                    <Input
                        label="Admin Passphrase"
                        type="password"
                        value={formData.adminCode}
                        onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                        placeholder="••••••••••••"
                        required
                    />
                    <Input
                        label="Create Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        required
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        required
                    />

                    {error && (
                        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginBottom: '1.25rem' }}
                    >
                        {loading ? 'Verifying & Provisioning...' : 'Provision Admin Account'}
                    </Button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                    Already an authorized admin?{' '}
                    <Link href="/admin-login" style={{ color: '#60a5fa', fontWeight: 600 }}>
                        Sign In Here
                    </Link>
                </div>
            </Card>
        </div>
    );
}
