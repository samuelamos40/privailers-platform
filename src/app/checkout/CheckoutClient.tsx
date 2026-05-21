"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { usePaystackPayment } from "react-paystack";

export default function CheckoutClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [type, setType] = useState<string | null>(null);

    // Ambassador / Promo Code
    const [promoCode, setPromoCode] = useState(searchParams.get('ref') || '');
    const [promoStatus, setPromoStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [ambassador, setAmbassador] = useState<any>(null);
    const [discountPercent, setDiscountPercent] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            const checkoutType = searchParams.get('type');
            const id = searchParams.get('id');
            setType(checkoutType);

            if (!id) {
                router.push('/');
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            let fetchError;
            if (checkoutType === 'cohort') {
                const { data, error } = await supabase.from('cohorts').select('*, course:courses(title)').eq('id', id).single();
                setItem(data);
                fetchError = error;
            } else {
                const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
                setItem(data);
                fetchError = error;
            }

            if (fetchError || !item) {
                // handle error
            }
            setLoading(false);

            // Auto-apply ref code from URL
            const refCode = searchParams.get('ref');
            if (refCode) {
                applyPromoCode(refCode);
            }
        };
        fetchItem();
    }, [searchParams]);

    const applyPromoCode = async (code?: string) => {
        const codeToCheck = (code || promoCode).trim().toUpperCase();
        if (!codeToCheck) return;

        setPromoStatus('checking');

        const { data, error } = await supabase
            .from('ambassadors')
            .select('*')
            .eq('referral_code', codeToCheck)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            setPromoStatus('invalid');
            setAmbassador(null);
            setDiscountPercent(0);
        } else {
            setPromoStatus('valid');
            setAmbassador(data);
            setDiscountPercent(parseFloat(data.discount_value || 0));
        }
    };

    const removePromo = () => {
        setPromoCode('');
        setPromoStatus('idle');
        setAmbassador(null);
        setDiscountPercent(0);
    };

    const originalPrice = item?.price || 0;
    const discountAmount = Math.round(originalPrice * (discountPercent / 100));
    const finalPrice = originalPrice - discountAmount;

    const config = {
        reference: `PS_${new Date().getTime()}`,
        email: user?.email || "",
        amount: Math.round(finalPrice * 100),
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_dummy",
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money']
    };

    const initializePayment = usePaystackPayment(config as any);

    const handleSuccess = async (reference: any) => {
        // 1. Verify payment & enroll
        const res = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reference: reference.reference || reference.transaction,
                courseId: type === 'cohort' ? item.course_id : item.id,
                cohortId: type === 'cohort' ? item.id : null,
                userId: user.id
            })
        });

        const data = await res.json();

        // 2. Record ambassador referral if applicable
        if (ambassador && finalPrice > 0) {
            const commissionAmount = Math.round(finalPrice * (parseFloat(ambassador.commission_rate) / 100));

            await supabase.from('referrals').insert([{
                ambassador_id: ambassador.id,
                referred_user_id: user.id,
                referred_email: user.email,
                course_id: type === 'cohort' ? item.course_id : item.id,
                cohort_id: type === 'cohort' ? item.id : null,
                amount_paid: finalPrice,
                commission_amount: commissionAmount,
                commission_paid: false
            }]);

            // Update ambassador running totals
            await supabase.from('ambassadors').update({
                total_referrals: (ambassador.total_referrals || 0) + 1,
                total_earned: parseFloat(ambassador.total_earned || 0) + commissionAmount
            }).eq('id', ambassador.id);
        }

        if (data.success) {
            alert("Payment successful! Welcome to the classroom 🎓");
            router.push(type === 'cohort' ? `/student/courses/${item.course_id || 'standalone'}` : `/student/courses/${item.id}`);
        } else {
            alert("Payment verification failed: " + data.error);
        }
    };

    if (loading) return <div style={{ padding: '8rem', textAlign: 'center' }}>Initializing Secure Checkout...</div>;

    if (!item) return <div style={{ padding: '8rem', textAlign: 'center' }}>Error: Item not found.</div>;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar />
            <div className="container" style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1rem' }}>
                <Card padding="lg">
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>Secure Checkout</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>Complete your enrollment for the mentored batch.</p>

                    {/* Order Summary */}
                    <div style={{ backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.name || item.title}</div>
                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{type === 'cohort' ? 'Instructor-Led Batch' : 'Self-Paced Course'}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {discountPercent > 0 ? (
                                    <>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>₦{originalPrice.toLocaleString()}</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#059669' }}>₦{finalPrice.toLocaleString()}</div>
                                    </>
                                ) : (
                                    <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>₦{originalPrice.toLocaleString()}</div>
                                )}
                            </div>
                        </div>
                        {discountPercent > 0 && (
                            <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
                                    🎉 {discountPercent}% discount applied — You save ₦{discountAmount.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Promo Code Section */}
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', backgroundColor: '#fafbfc' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                            🎟️ Have a referral or promo code?
                        </label>
                        {promoStatus === 'valid' ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0' }}>
                                <div>
                                    <span style={{ fontWeight: 700, color: '#166534', letterSpacing: '1px' }}>{promoCode.toUpperCase()}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#059669', marginLeft: '0.5rem' }}>✓ Applied ({discountPercent}% off)</span>
                                </div>
                                <button onClick={removePromo} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Remove</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoStatus('idle'); }}
                                    placeholder="Enter code (e.g. DAVE20)"
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}
                                />
                                <Button variant="outline" onClick={() => applyPromoCode()} disabled={!promoCode.trim() || promoStatus === 'checking'}>
                                    {promoStatus === 'checking' ? '...' : 'Apply'}
                                </Button>
                            </div>
                        )}
                        {promoStatus === 'invalid' && (
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 500 }}>
                                Invalid or expired code. Please check and try again.
                            </p>
                        )}
                    </div>

                    {/* Pay Button */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Button 
                            variant="primary" 
                            size="lg" 
                            style={{ width: '100%', justifyContent: 'center', height: '60px', fontSize: '1.1rem', fontWeight: 700 }}
                            onClick={() => initializePayment({ onSuccess: handleSuccess, onClose: () => {} })}
                        >
                            Pay ₦{finalPrice.toLocaleString()} Now
                        </Button>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                            Secured by Paystack. Card, Bank, and USSD supported.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
