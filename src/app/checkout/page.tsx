"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { usePaystackPayment } from "react-paystack";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [type, setType] = useState<string | null>(null);

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
        };
        fetchItem();
    }, [searchParams]);

    const discountedPrice = item?.price || 0;

    const config = {
        reference: `PS_${new Date().getTime()}`,
        email: user?.email || "",
        amount: Math.round(discountedPrice * 100),
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_dummy",
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money']
    };

    const initializePayment = usePaystackPayment(config as any);

    const handleSuccess = async (reference: any) => {
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

                    <div style={{ backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.name || item.title}</div>
                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>{type === 'cohort' ? 'Instructor-Led Batch' : 'Self-Paced Course'}</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>₦{discountedPrice.toLocaleString()}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Button 
                            variant="primary" 
                            size="lg" 
                            style={{ width: '100%', justifyContent: 'center', height: '60px', fontSize: '1.1rem', fontWeight: 700 }}
                            onClick={() => initializePayment({ onSuccess: handleSuccess, onClose: () => {} })}
                        >
                            Pay ₦{discountedPrice.toLocaleString()} Now
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

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
