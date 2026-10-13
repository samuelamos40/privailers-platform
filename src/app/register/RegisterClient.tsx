"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function RegisterClient() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo');
    const [step, setStep] = useState<1 | 2>(1);
    const [intent, setIntent] = useState<'cohort' | 'free' | 'paid' | null>(null);
    const [activeCohorts, setActiveCohorts] = useState<any[]>([]);
    const [premiumCourses, setPremiumCourses] = useState<any[]>([]);
    const [selectedCohortId, setSelectedCohortId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [refCode, setRefCode] = useState(searchParams.get('ref') || '');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch active cohorts
            const { data: cohorts } = await supabase
                .from('cohorts')
                .select(`
                    id, name, status, start_date, course_id, price,
                    course:courses(id, title)
                `)
                .eq('status', 'open');

            if (cohorts && cohorts.length > 0) {
                setActiveCohorts(cohorts);
                setSelectedCohortId(cohorts[0].id);
            }

            // Fetch Premium Self-Paced Courses
            const { data: courses } = await supabase
                .from('courses')
                .select('id, title, price')
                .eq('tier', 'paid');
            
            if (courses && courses.length > 0) {
                setPremiumCourses(courses);
                setSelectedCourseId(courses[0].id);
            }
        };
        fetchData();
    }, []);

    const selectedCohort = activeCohorts.find(c => c.id === selectedCohortId);
    const selectedCourse = premiumCourses.find(c => c.id === selectedCourseId);
    const basePrice = intent === 'cohort' ? Number(selectedCohort?.price || 0) : intent === 'paid' ? Number(selectedCourse?.price || 0) : 0;
    const price = basePrice;

    const handleNextStep = () => {
        if (!intent) {
            setError('Please select your preferred learning track to proceed.');
            return;
        }
        if (intent === 'cohort' && !selectedCohortId && activeCohorts.length > 0) {
            setError('Please choose which cohort batch you wish to join.');
            return;
        }
        if (intent === 'paid' && !selectedCourseId && premiumCourses.length > 0) {
            setError('Please choose a course you wish to purchase.');
            return;
        }
        setError('');
        setStep(2);
    };

    const executeRegistration = async () => {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'student'
                    }
                }
            });

            if (authError) throw authError;

            // 2. Direct enrollment for free tracks
            if (authData?.user) {
                if (intent === 'cohort' && selectedCohortId) {
                    const cohort = activeCohorts.find(c => c.id === selectedCohortId);
                    if (cohort) {
                        await supabase.from('enrollments').insert([
                            {
                                user_id: authData.user.id,
                                course_id: cohort.course_id || null,
                                cohort_id: cohort.id,
                                status: 'active'
                            }
                        ]);
                    }
                } else if (intent === 'paid' && selectedCourseId) {
                    await supabase.from('enrollments').insert([
                        {
                            user_id: authData.user.id,
                            course_id: selectedCourseId,
                            status: 'active'
                        }
                    ]);
                }
            }

            // 3. Referral record for free accounts
            if (refCode && authData?.user) {
                const { data: amb } = await supabase
                    .from('ambassadors')
                    .select('*')
                    .eq('referral_code', refCode.toUpperCase())
                    .eq('is_active', true)
                    .maybeSingle();
                
                if (amb) {
                    await supabase.from('referrals').insert([{
                        ambassador_id: amb.id,
                        referred_user_id: authData.user.id,
                        referred_email: formData.email,
                        amount_paid: 0,
                        commission_amount: 0,
                        commission_paid: false
                    }]);
                    await supabase.from('ambassadors').update({
                        total_referrals: (amb.total_referrals || 0) + 1
                    }).eq('id', amb.id);
                }
            }

            // Auto-signin if session was established
            await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
            
            if (redirectTo) {
                router.push(redirectTo);
            } else {
                router.push('/student');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please check your details and try again.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        if ((intent === 'cohort' || intent === 'paid') && price > 0) {
            // Redirect to checkout with referral code so discount + commission tracking happens securely
            const courseId = intent === 'cohort' ? selectedCohortId : selectedCourseId;
            const checkoutType = intent === 'cohort' ? 'cohort' : 'course';

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: 'student'
                    }
                }
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            // Sign in
            await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });

            // Direct forward to checkout
            const refParam = refCode ? `&ref=${refCode.toUpperCase()}` : '';
            router.push(`/checkout?type=${checkoutType}&id=${courseId}${refParam}`);
        } else {
            executeRegistration();
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '640px', width: '100%', backgroundColor: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)', padding: '2.5rem', overflow: 'hidden' }}>
                
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--primary-blue)', color: 'white', fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 800 }}>
                        P
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--primary-blue)', margin: '0 0 0.5rem 0', letterSpacing: '-0.025em' }}>
                        Create Student Account
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                        Start your journey with Privailers Data Academy
                    </p>
                </div>

                {/* Progress Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--primary-blue)' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                            1
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: step === 1 ? 700 : 500, color: step === 1 ? 'var(--primary-blue)' : '#64748b' }}>
                            Choose Track
                        </span>
                    </div>

                    <div style={{ width: '40px', height: '2px', backgroundColor: step === 2 ? 'var(--primary-blue)' : '#e2e8f0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step === 2 ? 'var(--primary-blue)' : '#cbd5e1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                            2
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: step === 2 ? 700 : 500, color: step === 2 ? 'var(--primary-blue)' : '#64748b' }}>
                            Account Details
                        </span>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div style={{ padding: '0.875rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* STEP 1: Select Learning Track */}
                {step === 1 && (
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>
                                Select your learning format:
                            </h2>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                                Choose how you want to learn with us. You can always explore other formats later.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {/* Track 1: Cohort */}
                            <div 
                                onClick={() => setIntent('cohort')}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: intent === 'cohort' ? '2px solid var(--primary-blue)' : '1px solid #e2e8f0',
                                    backgroundColor: intent === 'cohort' ? 'rgba(6, 30, 72, 0.04)' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: intent === 'cohort' ? '0 4px 12px rgba(6, 30, 72, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>👨‍🏫</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary-blue)', fontSize: '1rem' }}>
                                            Live Instructor-Led Cohort
                                        </span>
                                    </div>
                                    <span style={{ backgroundColor: 'rgba(0, 168, 156, 0.12)', color: 'var(--accent-teal-dark)', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase' }}>
                                        Mentorship
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0 2rem', lineHeight: 1.5 }}>
                                    Live interactive virtual classes, weekly graded assignments, and 1-on-1 instructor support.
                                </p>

                                {intent === 'cohort' && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #bae6fd', marginLeft: '2rem' }} onClick={(e) => e.stopPropagation()}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-blue)', marginBottom: '0.4rem' }}>
                                            Choose your batch:
                                        </label>
                                        {activeCohorts.length > 0 ? (
                                            <select
                                                value={selectedCohortId}
                                                onChange={(e) => setSelectedCohortId(e.target.value)}
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid var(--primary-blue)', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }}
                                            >
                                                {activeCohorts.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name} {c.price ? `(₦${Number(c.price).toLocaleString()})` : ''} - Starts {new Date(c.start_date).toLocaleDateString()}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div style={{ padding: '0.5rem', backgroundColor: '#fffbeb', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#92400e' }}>
                                                New live cohorts opening soon! You can enroll now or browse self-paced options.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Track 2: Premium Self-Paced */}
                            <div 
                                onClick={() => { setIntent('paid'); }}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: intent === 'paid' ? '2px solid var(--primary-blue)' : '1px solid #e2e8f0',
                                    backgroundColor: intent === 'paid' ? 'rgba(6, 30, 72, 0.04)' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: intent === 'paid' ? '0 4px 12px rgba(6, 30, 72, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>🚀</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary-blue)', fontSize: '1rem' }}>
                                            Premium Self-Paced Courses
                                        </span>
                                    </div>
                                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase' }}>
                                        Flexible
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0 2rem', lineHeight: 1.5 }}>
                                    Full curriculum access, downloadable datasets, and self-guided project modules.
                                </p>

                                {intent === 'paid' && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #bae6fd', marginLeft: '2rem' }} onClick={(e) => e.stopPropagation()}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary-blue)', marginBottom: '0.4rem' }}>
                                            Choose course to unlock:
                                        </label>
                                        {premiumCourses.length > 0 ? (
                                            <select
                                                value={selectedCourseId}
                                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1.5px solid var(--primary-blue)', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.875rem', fontWeight: 600, outline: 'none' }}
                                            >
                                                {premiumCourses.map(crs => (
                                                    <option key={crs.id} value={crs.id}>
                                                        {crs.title} {crs.price ? `- ₦${Number(crs.price).toLocaleString()}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                                                Select after registration from the student catalog.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Track 3: Free Tier */}
                            <div 
                                onClick={() => { setIntent('free'); }}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: intent === 'free' ? '2px solid var(--primary-blue)' : '1px solid #e2e8f0',
                                    backgroundColor: intent === 'free' ? 'rgba(6, 30, 72, 0.04)' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: intent === 'free' ? '0 4px 12px rgba(6, 30, 72, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span style={{ fontSize: '1.25rem' }}>🔓</span>
                                        <span style={{ fontWeight: 700, color: 'var(--primary-blue)', fontSize: '1rem' }}>
                                            Free Starter Track
                                        </span>
                                    </div>
                                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase' }}>
                                        Zero Cost
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 0 2rem', lineHeight: 1.5 }}>
                                    Access introductory modules and foundational lessons at zero upfront cost.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleNextStep}
                            style={{ width: '100%', justifyContent: 'center', fontWeight: 700, borderRadius: '0.75rem', padding: '0.875rem' }}
                            disabled={!intent}
                        >
                            Continue to Step 2 →
                        </Button>
                    </div>
                )}

                {/* STEP 2: Account Details */}
                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        {/* Summary Pill */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>
                                    {intent === 'cohort' ? '👨‍🏫' : intent === 'paid' ? '🚀' : '🔓'}
                                </span>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                                        {intent === 'cohort' 
                                            ? `Cohort: ${selectedCohort?.name || 'Live Batch'}`
                                            : intent === 'paid' 
                                            ? `Course: ${selectedCourse?.title || 'Premium Course'}`
                                            : 'Free Starter Track'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {price > 0 ? `Fee: ₦${price.toLocaleString()}` : 'Free Access'}
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setStep(1)} 
                                style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Change Track
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <Input
                                label="Full Name"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="e.g. Chukwuma Obi"
                                required
                            />
                            
                            <Input
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@example.com"
                                required
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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
                            </div>

                            {/* Referral / Promo Code */}
                            <div style={{ padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', backgroundColor: '#f8fafc' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                                    <span>🎟️</span>
                                    <span>Referral or Ambassador Code (Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={refCode}
                                    onChange={(e) => setRefCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                    placeholder="e.g. AMBASSADOR10"
                                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em', color: '#0f172a', textTransform: 'uppercase' }}
                                />
                                {refCode && (
                                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '0.35rem' }}>
                                        ✓ Referral code will be verified and discounted at checkout.
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '1.75rem', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700 }}
                        >
                            {loading ? 'Creating Your Account...' : (price > 0 ? 'Create Account & Proceed to Checkout →' : 'Complete Registration →')}
                        </Button>
                    </form>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '2rem' }}>
                    Already have an account?{' '}
                    <Link href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"} style={{ color: '#003366', fontWeight: 700, textDecoration: 'none' }}>
                        Sign In here
                    </Link>
                </div>
            </div>
        </div>
    );
}
