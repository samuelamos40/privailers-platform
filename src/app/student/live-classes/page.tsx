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
            // Instant load from sessionStorage cache
            try {
                const cached = sessionStorage.getItem('privailers_student_live_classes');
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setClasses(parsed);
                        setLoading(false);
                    }
                }
            } catch (e) {}

            fetchClasses();
            if (targetCohortId) fetchTargetCohort();

            // Realtime subscription for class status updates
            const channel = supabase
                .channel('student_live_classes_updates')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'cohort_classes' 
                }, () => {
                    fetchClasses(); 
                })
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'live_classes' 
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

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch('/api/student/live-classes', {
                headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
            });
            const data = await res.json();
            if (data && Array.isArray(data.classes)) {
                const finalClasses = data.classes
                    .filter((c: any) => ['scheduled', 'ongoing', 'live'].includes(c.status) || (c.status === 'completed' && c.recording_url))
                    .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
                setClasses(finalClasses);
                try {
                    sessionStorage.setItem('privailers_student_live_classes', JSON.stringify(finalClasses));
                } catch (e) {}
                setLoading(false);
                return;
            }
        } catch (apiErr) {
            console.error("Live classes API error, trying fallback:", apiErr);
        }

        // Fallback to direct client query
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select(`
                course_id, cohort_id,
                course:courses(id, title),
                cohort:cohorts(id, name, course_id)
            `)
            .eq('user_id', user?.id);
            
        const userEnrollments = (enrollments as any[]) || [];
        const cohortIds = userEnrollments.map(e => e.cohort_id).filter(Boolean);
        const directCourseIds = userEnrollments.map(e => e.course_id).filter(Boolean);
        const cohortCourseIds = userEnrollments.map(e => {
            const c = Array.isArray(e.cohort) ? e.cohort[0] : e.cohort;
            return c?.course_id;
        }).filter(Boolean);
        const uniqueCourseIds = Array.from(new Set([...directCourseIds, ...cohortCourseIds]));

        let orLiveFilters = ['and(course_id.is.null,cohort_id.is.null)'];
        if (cohortIds.length > 0) orLiveFilters.push(`cohort_id.in.(${cohortIds.join(',')})`);
        if (uniqueCourseIds.length > 0) orLiveFilters.push(`course_id.in.(${uniqueCourseIds.join(',')})`);

        const [cohortRes, liveRes] = await Promise.all([
            cohortIds.length > 0
                ? supabase
                    .from('cohort_classes')
                    .select('*, cohort:cohorts(name)')
                    .in('cohort_id', cohortIds)
                    .in('status', ['scheduled', 'ongoing', 'live', 'completed'])
                    .order('scheduled_at', { ascending: true })
                : Promise.resolve({ data: [] }),
            supabase
                .from('live_classes')
                .select('*, course:courses(title), cohort:cohorts(name)')
                .or(orLiveFilters.join(','))
                .in('status', ['scheduled', 'ongoing', 'live', 'completed'])
                .order('scheduled_at', { ascending: true })
        ]);

        let combined: any[] = [];

        if (cohortRes.data) {
            const mappedCohort = cohortRes.data.map(c => ({
                ...c,
                classType: 'cohort',
                displayName: c.cohort?.name ? `Batch: ${c.cohort.name}` : 'Mentored Cohort'
            }));
            combined = [...combined, ...mappedCohort];
        }

        if (liveRes.data) {
            const mappedLive = liveRes.data.map(c => ({
                ...c,
                classType: 'course_live',
                displayName: c.course?.title 
                    ? `Course: ${c.course.title}` 
                    : c.cohort?.name 
                        ? `Batch: ${c.cohort.name}` 
                        : 'Platform Event'
            }));
            combined = [...combined, ...mappedLive];
        }

        const finalClasses = combined
            .filter(c => ['scheduled', 'ongoing', 'live'].includes(c.status) || (c.status === 'completed' && c.recording_url))
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

        setClasses(finalClasses);
        try {
            sessionStorage.setItem('privailers_student_live_classes', JSON.stringify(finalClasses));
        } catch (e) {}
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
                        const startTime = new Date(c.scheduled_at).getTime();
                        const now = new Date().getTime();
                        const isLive = c.status === 'ongoing' || c.status === 'live' || (c.status !== 'completed' && now >= startTime && now <= startTime + (2 * 60 * 60 * 1000));
                        const isExternal = c.meeting_url && c.meeting_url !== 'internal_platform_room' && c.meeting_url.startsWith('http');
                        const targetRoomLink = c.classType === 'cohort' ? `/classroom/${c.id}` : `/student/live-classes/room/${c.id}`;

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
                                    
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span>🗓️</span> 
                                        {new Date(c.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} WAT
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                            {c.classType === 'cohort' ? `👥 ${c.displayName}` : `🎓 ${c.displayName}`}
                                        </span>
                                        {isExternal && (
                                            <span style={{ fontSize: '0.8rem', color: '#059669', backgroundColor: '#ecfdf5', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                                                🔗 Google Meet / Zoom
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, flex: 1 }}>
                                    {c.description || "Join this live session. Access details will be provided upon entry."}
                                </p>
                                
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    {isLive ? (
                                        isExternal ? (
                                            <a href={c.meeting_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                                <Button variant="primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#2563eb', borderColor: '#2563eb', fontSize: '1rem', fontWeight: 600 }}>
                                                    ▶ Open Google Meet / Zoom
                                                </Button>
                                            </a>
                                        ) : (
                                            <a href={targetRoomLink} style={{ textDecoration: 'none' }}>
                                                <Button variant="primary" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', borderColor: '#ef4444', fontSize: '1rem', fontWeight: 600 }}>
                                                    ▶ Join Live Room
                                                </Button>
                                            </a>
                                        )
                                    ) : c.recording_url ? (
                                        <a href={c.recording_url} target="_blank" style={{ textDecoration: 'none' }}>
                                            <Button style={{ width: '100%', backgroundColor: '#7c3aed', color: 'white', borderColor: '#7c3aed' }}>🎥 Watch Recording</Button>
                                        </a>
                                    ) : (
                                        <Button variant="outline" disabled style={{ width: '100%', justifyContent: 'center', backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                                            {c.status === 'completed' ? 'Session Ended' : `Starts at ${new Date(c.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
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
