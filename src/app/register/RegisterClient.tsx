"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { usePaystackPayment } from 'react-paystack';
import { useSearchParams } from 'next/navigation';

export default function RegisterClient() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo');
    const [step, setStep] = useState(1);
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

            if (cohorts) setActiveCohorts(cohorts);

            // Fetch Premium Self-Paced Courses
            const { data: courses } = await supabase
                .from('courses')
                .select('id, title, price')
                .eq('tier', 'paid');
            
            if (courses) setPremiumCourses(courses);
        };
        fetchData();
    }, []);

    // CONFIG FOR PAYSTACK
    const cohort = activeCohorts.find(c => c.id === selectedCohortId);
    const course = premiumCourses.find(c => c.id === selectedCourseId);
    const basePrice = intent === 'cohort' ? Number(cohort?.price || 0) : intent === 'paid' ? Number(course?.price || 0) : 0;
    const price = basePrice; // Discount applied at checkout via ref code

    const paystackConfig = {
        reference: `REG_${new Date().getTime()}`,
        email: formData.email,
        amount: Math.round(price * 100),
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_dummy",
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money']
    };

    const initializePayment = usePaystackPayment(paystackConfig as any);

    const handleNextStep = () => {
        if (!intent) {
            setError('Please select your primary goal to continue.');
            return;
        }
        if (intent === 'cohort' && !selectedCohortId) {
            setError('Please select the specific cohort you wish to join.');
            return;
        }
        if (intent === 'paid' && !selectedCourseId) {
            setError('Please select the premium course you wish to purchase.');
            return;
        }
        setError('');
        setStep(2);
    };

    const executeRegistration = async (isPaid: boolean = false) => {
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

            // 2. Enroll specifically in the cohort or premium course
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

            const successMessage = isPaid 
                ? 'Account created and payment confirmed! Welcome to Privailers.' 
                : 'Account created successfully! Welcome to Privailers.';
            
            // Record referral for free registrations (paid ones are tracked at checkout)
            if (!isPaid && refCode && authData?.user) {
                const { data: amb } = await supabase
                    .from('ambassadors')
                    .select('*')
                    .eq('referral_code', refCode.toUpperCase())
                    .eq('is_active', true)
                    .single();
                
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

            alert(successMessage);
            if (redirectTo) {
                router.push(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
            } else {
                router.push('/login');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed.');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
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

        if ((intent === 'cohort' || intent === 'paid') && price > 0) {
            // Redirect to checkout with ref code so discount + referral tracking happens there
            const courseId = intent === 'cohort' ? selectedCohortId : selectedCourseId;
            const checkoutType = intent === 'cohort' ? 'cohort' : 'course';
            // First create the account
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
            // Redirect to checkout
            const refParam = refCode ? `&ref=${refCode.toUpperCase()}` : '';
            router.push(`/checkout?type=${checkoutType}&id=${courseId}${refParam}`);
        } else {
            executeRegistration(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
            <Card padding="lg" style={{ maxWidth: '600px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Create Student Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Join Privailers Data Academy</p>
                </div>

                {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', textAlign: 'center' }}>
                            What brings you to Privailers?
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                            <button
                                type="button"
                                onClick={() => setIntent('cohort')}
                                style={{
                                    padding: '1.5rem', border: intent === 'cohort' ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                                    backgroundColor: intent === 'cohort' ? '#eff6ff' : 'white',
                                    borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                    boxShadow: intent === 'cohort' ? '0 4px 6px -1px rgba(37, 99, 235, 0.1)' : 'none'
                                }}
                            >
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.25rem' }}>👨‍🏫 Join an Instructor-Led Cohort</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Get direct mentorship, live classes, and graded assignments.</div>
                            </button>

                            {intent === 'cohort' && (
                                <div style={{ marginLeft: '2rem', marginTop: '-0.5rem', marginBottom: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Select Upcoming Cohort:</label>
                                    <select
                                        value={selectedCohortId}
                                        onChange={(e) => setSelectedCohortId(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #2563eb', backgroundColor: 'white' }}
                                    >
                                        <option value="" disabled>-- Select an Active Cohort --</option>
                                        {activeCohorts.length === 0 && <option disabled>No active cohorts currently open.</option>}
                                        {activeCohorts.map(cohort => (
                                            <option key={cohort.id} value={cohort.id}>
                                                {cohort.name} - {cohort.course?.title || cohort.title || 'Specialized Live Batch'} (Starts {new Date(cohort.start_date).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => { setIntent('free'); setSelectedCohortId(''); }}
                                style={{
                                    padding: '1.5rem', border: intent === 'free' ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                                    backgroundColor: intent === 'free' ? '#eff6ff' : 'white',
                                    borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.25rem' }}>🔓 Explore Free Courses (Trial Access)</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Start learning at zero cost. Note: Admin may set expiration or deactivate inactive free accounts.</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setIntent('paid'); setSelectedCohortId(''); }}
                                style={{
                                    padding: '1.5rem', border: intent === 'paid' ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                                    backgroundColor: intent === 'paid' ? '#eff6ff' : 'white',
                                    borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.25rem' }}>🚀 Premium Paced Courses</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Purchase high-quality, self-paced premium courses.</div>
                            </button>

                            {intent === 'paid' && (
                                <div style={{ marginLeft: '2rem', marginTop: '-0.5rem', marginBottom: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Select Course to Purchase:</label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #2563eb', backgroundColor: 'white' }}
                                    >
                                        <option value="" disabled>-- Select a Premium Course --</option>
                                        {premiumCourses.length === 0 && <option disabled>No premium courses available yet.</option>}
                                        {premiumCourses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.title} - ₦{course.price?.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleNextStep}
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={!intent || (intent === 'cohort' && !selectedCohortId && activeCohorts.length > 0)}
                        >
                            Continue →
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                Goal: {intent === 'cohort' ? 'Join Cohort' : intent === 'free' ? 'Free Courses' : 'Premium Courses'}
                            </span>
                            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
                                Change
                            </button>
                        </div>

                        <Input
                            label="Full Name"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="John Doe"
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
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

                        <div style={{ padding: '0.75rem', border: '1px dashed #cbd5e1', borderRadius: '0.5rem', backgroundColor: '#fafbfc' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                                🎟️ Referral / Promo Code (optional)
                            </label>
                            <input
                                type="text"
                                value={refCode}
                                onChange={(e) => setRefCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                placeholder="e.g. DAVE20"
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}
                            />
                            {refCode && (
                                <p style={{ fontSize: '0.7rem', color: '#059669', marginTop: '0.25rem' }}>
                                    ✓ Code will be applied at checkout for paid courses
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem', marginTop: '1rem' }}
                        >
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                        </Button>
                    </form>
                )}

                <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    Already have an account?{' '}
                    <Link href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"} style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                        Sign In
                    </Link>
                </div>
            </Card>
        </div>
    );
}
