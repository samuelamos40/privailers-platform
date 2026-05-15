"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

    const ADMIN_REGISTRATION_CODE = 'PRIVAILERS_ADMIN_2026'; // Change this to your secret code

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (formData.adminCode !== ADMIN_REGISTRATION_CODE) {
            setError('Invalid admin registration code');
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
            // 1. Create auth user in Supabase Auth
            // Usage metadata for the Trigger
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'admin'
                    }
                }
            });

            if (authError) throw authError;

            // Success! The Trigger handles the DB records.
            alert('Admin account created successfully! Please check your email to confirm, then log in.');
            router.push('/admin-login');

        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
            <Card padding="lg" style={{ maxWidth: '500px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Create Admin Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Requires admin registration code</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Full Name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Admin Name"
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="admin@privailers.com"
                        required
                    />
                    <Input
                        label="Admin Registration Code"
                        type="password"
                        value={formData.adminCode}
                        onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                        placeholder="Enter admin code"
                        required
                    />
                    <Input
                        label="Password"
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
                        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                    </Button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <Link href="/admin-login" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                        Sign In
                    </Link>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#92400e' }}>
                    <strong>Admin Code:</strong> PRIVAILERS_ADMIN_2026
                </div>
            </Card>
        </div>
    );
}
