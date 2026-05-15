"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';
import Input from './Input';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialMode?: 'login' | 'register';
}

export default function LoginModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: LoginModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await signIn(email, password);
                if (onSuccess) onSuccess();
                onClose();
            } else {
                // For registration, we still want to keep it simple or redirect to the full registration
                // But for a "Udemy" feel, we can do a quick sign up here
                // For now, let's just redirect to register if they want full registration, 
                // OR implement a quick signup.
                window.location.href = `/register?redirectTo=${window.location.pathname}`;
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '450px',
                borderRadius: '1.5rem',
                padding: '2.5rem',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'modalFadeIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <style jsx>{`
                    @keyframes modalFadeIn {
                        from { transform: translateY(20px); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `}</style>

                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#64748b'
                }}>×</button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                        {mode === 'login' ? 'Welcome Back' : 'Join Privailers'}
                    </h2>
                    <p style={{ color: '#64748b' }}>
                        {mode === 'login' ? 'Login to continue your learning journey' : 'Create an account to start learning'}
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <Input
                            label="Full Name"
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="John Doe"
                            required
                        />
                    )}
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1rem', fontSize: '1rem', fontWeight: 700 }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
                    {mode === 'login' ? (
                        <>
                            Don't have an account?{' '}
                            <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign Up</button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Sign In</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
