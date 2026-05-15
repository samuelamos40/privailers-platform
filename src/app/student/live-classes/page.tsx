"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePaystackPayment } from 'react-paystack';

export default function StudentLiveClassesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const targetCohortId = searchParams.get('cohortId');

    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [targetCohort, setTargetCohort] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Paystack Config
    const cohortPrice = targetCohort ? parseFloat(targetCohort.price || targetCohort.course?.price || "0") : 0;
    const paystackConfig = {
        reference: `B_${new Date().getTime()}`,
        email: user?.email || "",
        amount: Math.round(cohortPrice * 100),
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_dummy",
    };
    const initializePayment = usePaystackPayment(paystackConfig as any);

    useEffect(() => {
        if (user) {
            fetchClasses();
            if (targetCohortId) fetchTargetCohort();

            // Realtime subscription for class status updates
            const channel = supabase
                .channel('live_classes_updates')
                .on('postgres_changes', { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'cohort_classes' 
                }, () => {
                    fetchClasses(); 
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, targetCohortId]);

    const fetchTargetCohort = async () => {
        const { data } = await supabase
            .from('cohorts')
            .select('*, course:courses(title, price)')
            .eq('id', targetCohortId)
            .single();
        if (data) setTargetCohort(data);
    };

    const fetchClasses = async () => {
        setLoading(true);
        // Fetch classes specifically for the cohorts the user is enrolled in
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('cohort_id')
            .eq('user_id', user?.id)
            .not('cohort_id', 'is', null);
            
        const cohortIds = enrollments?.map(e => e.cohort_id) || [];

        if (cohortIds.length === 0) {
            setClasses([]);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('cohort_classes')
            .select('*, cohort:cohorts(name)')
            .in('cohort_id', cohortIds)
            .in('status', ['scheduled', 'ongoing', 'completed'])
            .order('scheduled_at', { ascending: true });

        if (!error && data) {
            setClasses(data.filter(c => 
                ['scheduled', 'ongoing'].includes(c.status) || (c.status === 'completed' && c.recording_url)
            ));
        }
        setLoading(false);
    };

    const handleJoinCohort = async () => {
        if (!user || !targetCohort) return;
        
        if (cohortPrice > 0) {
            setIsProcessing(true);
            initializePayment({
                onSuccess: async () => {
                    await finalizeEnrollment();
                },
                onClose: () => setIsProcessing(false)
            } as any);
        } else {
            await finalizeEnrollment();
        }
    };

    const finalizeEnrollment = async () => {
        try {
            await supabase.from('enrollments').insert([{
                user_id: user?.id,
                cohort_id: targetCohort.id,
                course_id: targetCohort.course_id,
                status: 'active',
                progress: 0
            }]);
            alert("Welcome to the batch!");
            setTargetCohort(null);
            fetchClasses();
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                    Live Classes & Webinars
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                    Join interactive sessions with your instructors and peers.
                </p>
            </div>

            {targetCohort && (
                <div style={{ 
                    marginBottom: '3rem', padding: '2.5rem', backgroundColor: '#1e293b', color: 'white', borderRadius: '1.5rem',
                    textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Join {targetCohort.name}</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                        You're one step away from joining this exclusive mentored batch.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                            ₦{parseFloat(targetCohort.price || targetCohort.course?.price || "0").toLocaleString()}
                        </div>
                        <Button 
                            variant="primary" 
                            size="lg" 
                            onClick={handleJoinCohort} 
                            disabled={isProcessing}
                            style={{ padding: '1rem 3rem', minWidth: '200px' }}
                        >
                            {isProcessing ? 'Processing...' : 'Complete Registration'}
                        </Button>
                        <button 
                            onClick={() => setTargetCohort(null)}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            Not now, show my schedule
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    Fetching schedule...
                </div>
            ) : classes.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📅</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>No Upcoming Classes</h3>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Check back later! When instructors schedule live sessions, they will appear here.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {classes.map(c => {
                        const isLive = c.status === 'ongoing';
                        return (
                            <Card key={c.id} style={{ 
                                display: 'flex', flexDirection: 'column', 
                                borderTop: isLive ? '4px solid #ef4444' : '4px solid #3b82f6'
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                            {c.title}
                                        </h3>
                                        {isLive && (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '1rem', backgroundColor: '#fef2f2', color: '#ef4444', animation: 'pulse 2s infinite' }}>
                                                LIVE NOW
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>🗓️</span> 
                                        {new Date(c.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} WAT
                                    </div>
                                    
                                    {c.cohort?.name && (
                                        <div style={{ fontSize: '0.85rem', color: '#8b5cf6', marginTop: '0.5rem', fontWeight: 500 }}>
                                            👥 Batch: {c.cohort.name}
                                        </div>
                                    )}
                                </div>
                                
                                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, flex: 1 }}>
                                    {c.description || "Join this live session. Access details will be provided upon entry."}
                                </p>
                                
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    {isLive ? (
                                        <a href={`/classroom/${c.id}`} style={{ textDecoration: 'none' }}>
                                            <Button variant="primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444', fontSize: '1rem', fontWeight: 600 }}>
                                                ▶ Join Live Room
                                            </Button>
                                        </a>
                                    ) : c.recording_url ? (
                                        <a href={c.recording_url} target="_blank" style={{ textDecoration: 'none' }}>
                                            <Button style={{ width: '100%', backgroundColor: '#7c3aed', color: 'white', borderColor: '#7c3aed' }}>🎥 Watch Recording</Button>
                                        </a>
                                    ) : (
                                        <Button variant="outline" disabled style={{ width: '100%', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                                            {c.status === 'completed' ? 'Session Ended' : 'Meeting starts later'}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
