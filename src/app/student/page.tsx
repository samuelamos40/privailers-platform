"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Enrollment, Course } from '@/lib/supabase';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import CourseIcon from '@/components/ui/CourseIcon';
import Card from '@/components/ui/Card';

// Premium Light Card
const LightCard = ({ children, style, className }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) => (
    <div className={className} style={{
        backgroundColor: '#ffffff',
        borderRadius: '1.5rem',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.01)', // Soft Apple-like shadow
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style
    }}>
        {children}
    </div>
);

type EnrollmentWithCourse = Enrollment & {
    course: Course;
    cohort?: any;
    cohort_id?: string;
};

export default function StudentDashboard() {
    const { user, isAccountActive, isExpired } = useAuth();
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
    const [upcomingCohorts, setUpcomingCohorts] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [myClasses, setMyClasses] = useState<any[]>([]);
    const [generalLiveAlert, setGeneralLiveAlert] = useState<any>(null);

    useEffect(() => {
        if (user) {
            // Instant load from sessionStorage cache if available
            try {
                const cached = sessionStorage.getItem(`privailers_dashboard_${user.id}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.enrollments) setEnrollments(parsed.enrollments);
                    if (parsed.availableCourses) setAvailableCourses(parsed.availableCourses);
                    if (parsed.upcomingCohorts) setUpcomingCohorts(parsed.upcomingCohorts);
                    if (parsed.announcements) setAnnouncements(parsed.announcements);
                    if (parsed.myClasses) setMyClasses(parsed.myClasses);
                    if (parsed.generalLiveAlert) setGeneralLiveAlert(parsed.generalLiveAlert);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Cache read error:", err);
            }

            fetchData();

            // Realtime subscription for class status updates
            const channel = supabase
                .channel('dashboard_classes')
                .on('postgres_changes', { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'cohort_classes' 
                }, () => {
                    fetchData(); // Refresh all data when a class is updated
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [enrollResponse, coursesResponse, liveResponse, announcementResponse] = await Promise.all([
                supabase
                    .from('enrollments')
                    .select(`
                        id, user_id, course_id, cohort_id, status, progress, last_accessed,
                        course:courses ( id, title, description, tier, price ),
                        cohort:cohorts ( id, name, price, start_date )
                    `)
                    .eq('user_id', user?.id)
                    .order('last_accessed', { ascending: false }),

                supabase
                    .from('courses')
                    .select('id, title, description, tier, price, duration, created_at'),

                supabase
                    .from('live_classes')
                    .select(`
                        id, title, scheduled_at, status,
                        course:courses!inner(id, title, description, instructor:users(full_name))
                    `)
                    .neq('course_id', null)
                    .in('status', ['scheduled', 'live']),

                supabase
                    .from('cohort_announcements')
                    .select(`*, instructor:users(full_name)`)
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            const userEnrollments = (enrollResponse.data as any[]) || [];
            setEnrollments(userEnrollments);

            let finalClasses: any[] = [];
            let currentGeneralAlert: any = null;

            try {
                const { data: { session } } = await supabase.auth.getSession();
                const apiRes = await fetch('/api/student/live-classes', {
                    headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
                });
                const apiData = await apiRes.json();
                if (apiData && Array.isArray(apiData.classes)) {
                    finalClasses = apiData.classes
                        .filter((c: any) => ['scheduled', 'ongoing', 'live'].includes(c.status) || (c.status === 'completed' && c.recording_url))
                        .slice(0, 5);
                    if (apiData.generalAlerts && apiData.generalAlerts.length > 0) {
                        currentGeneralAlert = apiData.generalAlerts[0];
                    }
                }
            } catch (err) {
                console.error("Live classes API error, trying direct query:", err);
            }

            // Fallback to direct query if API was unavailable
            if (finalClasses.length === 0) {
                const myBatchIds = userEnrollments.map(e => e.cohort_id).filter(Boolean);
                const directCourseIds = userEnrollments.map(e => e.course_id).filter(Boolean);
                const cohortCourseIds = userEnrollments.map(e => {
                    const c = Array.isArray(e.cohort) ? e.cohort[0] : e.cohort;
                    return c?.course_id;
                }).filter(Boolean);
                const enrolledCourseIdsArray = Array.from(new Set([...directCourseIds, ...cohortCourseIds]));
                
                let orQueryParts = ['and(course_id.is.null,cohort_id.is.null)'];
                if (myBatchIds.length > 0) orQueryParts.push(`cohort_id.in.(${myBatchIds.join(',')})`);
                if (enrolledCourseIdsArray.length > 0) orQueryParts.push(`course_id.in.(${enrolledCourseIdsArray.join(',')})`);

                const [cohortClassesRes, globalClassesRes] = await Promise.all([
                    myBatchIds.length > 0
                        ? supabase.from('cohort_classes').select('*, cohort:cohorts(name)').in('cohort_id', myBatchIds)
                        : Promise.resolve({ data: [] }),
                    supabase.from('live_classes').select('*, course:courses(title), cohort:cohorts(name)').or(orQueryParts.join(','))
                ]);

                let allMyClasses: any[] = [];
                if (cohortClassesRes.data) allMyClasses = [...allMyClasses, ...cohortClassesRes.data];
                if (globalClassesRes.data) {
                    const normalizedGlobal = globalClassesRes.data.map((c: any) => ({
                        ...c,
                        title: c.course_id ? `[Course] ${c.title}` : c.cohort_id ? `[Cohort] ${c.title}` : `[General] ${c.title}`,
                        cohort: c.cohort || { name: c.course?.title || 'Platform Event' },
                        isGlobalLiveClass: true
                    }));
                    allMyClasses = [...allMyClasses, ...normalizedGlobal];
                }

                finalClasses = allMyClasses
                    .filter(c => ['scheduled', 'ongoing', 'live'].includes(c.status) || (c.status === 'completed' && c.recording_url))
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .slice(0, 5);
            }

            setMyClasses(finalClasses);
            setGeneralLiveAlert(currentGeneralAlert);

            const allCourses = coursesResponse.data || [];
            let freshAvailableCourses: Course[] = [];
            let freshUpcomingCohorts: any[] = [];
            if (allCourses.length > 0) {
                const enrolledCourseIds = new Set(userEnrollments.map(e => e.course_id));
                freshAvailableCourses = allCourses.filter(c => !enrolledCourseIds.has(c.id));
                setAvailableCourses(freshAvailableCourses);
                const activeCohorts = liveResponse.data || [];
                if (activeCohorts.length > 0) {
                    freshUpcomingCohorts = activeCohorts.filter((c: any) => !enrolledCourseIds.has(c.course?.id));
                    setUpcomingCohorts(freshUpcomingCohorts);
                }
            }
            const freshAnnouncements = announcementResponse.data || [];
            setAnnouncements(freshAnnouncements);

            // Save to cache for instant rendering next time
            try {
                if (user?.id) {
                    sessionStorage.setItem(`privailers_dashboard_${user.id}`, JSON.stringify({
                        enrollments: userEnrollments,
                        availableCourses: freshAvailableCourses,
                        upcomingCohorts: freshUpcomingCohorts,
                        announcements: freshAnnouncements,
                        myClasses: finalClasses,
                        generalLiveAlert: currentGeneralAlert
                    }));
                }
            } catch (err) {
                console.error("Cache save error:", err);
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClass = async (classId: string, isGlobalLiveClass?: boolean, meetingUrl?: string) => {
        if (!user) return;
        
        if (meetingUrl && meetingUrl !== 'internal_platform_room' && meetingUrl.startsWith('http')) {
            window.open(meetingUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        if (isGlobalLiveClass) {
            router.push(`/student/live-classes/room/${classId}`);
        } else {
            await supabase.from('cohort_attendance').upsert(
                [{ student_id: user.id, class_id: classId }],
                { onConflict: 'student_id,class_id' }
            );
            router.push(`/classroom/${classId}`);
        }
    };

    const activeEnrollments = enrollments.filter(e => e.status === 'active');
    const heroCourse = activeEnrollments[0];
    const otherEnrollments = activeEnrollments.slice(1);

    const totalProgress = activeEnrollments.length > 0
        ? Math.round(activeEnrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / activeEnrollments.length)
        : 0;

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.5rem', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <div style={{ height: '40px', width: '240px', maxWidth: '100%', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 2s infinite' }}></div>
            <div style={{ height: '280px', width: '100%', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                <div style={{ height: '180px', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
                <div style={{ height: '180px', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
                <div style={{ height: '180px', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );

    if (!isAccountActive && !loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem' }}>
            <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                    {isExpired ? 'Access Expired' : 'Account Deactivated'}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                    {isExpired 
                        ? "Your access period has come to an end. To continue learning, please upgrade your account or contact support."
                        : "Your account has been deactivated by an administrator. Please contact us if you believe this is a mistake."}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/courses">
                        <Button variant="primary" style={{ width: '100%' }}>View Premium Courses</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" style={{ width: '100%' }}>Return to Home</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );

    return (
        <div className="dashboard-container" style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            <style jsx>{`
                .dashboard-container {
                    padding: 2.5rem;
                }
                @media (max-width: 1023px) {
                    .dashboard-container {
                        padding: 1.5rem 1.25rem !important;
                    }
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .hero-content {
                        padding: 2rem !important;
                    }
                    .hero-image {
                        height: 220px !important;
                    }
                    .cohort-card-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 767px) {
                    .dashboard-container {
                        padding: 1rem 0.75rem !important;
                    }
                    .dashboard-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 1.25rem !important;
                        margin-bottom: 2rem !important;
                    }
                    .stats-pill {
                        width: 100% !important;
                        justify-content: space-around !important;
                        padding: 0.75rem 1rem !important;
                        border-radius: 1rem !important;
                    }
                    .hero-content {
                        padding: 1.5rem 1rem !important;
                    }
                    .hero-action-row {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 1.25rem !important;
                    }
                    .hero-action-row button,
                    .hero-action-row a {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                    .batch-alert {
                        flex-direction: column !important;
                        text-align: center !important;
                        padding: 1.25rem !important;
                    }
                    .courses-grid {
                        grid-template-columns: 1fr !important;
                    }
                    h1 {
                        font-size: 1.6rem !important;
                    }
                }
            `}</style>
            {/* Header */}
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#1e293b', marginBottom: '0.25rem' }}>
                        Hello, {user?.full_name?.split(' ')[0]} <span style={{ color: '#fbbf24' }}>👋</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Ready to continue learning?</p>
                </div>

                {/* Stats Pill - Light Mode */}
                <div className="stats-pill" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    backgroundColor: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '999px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>COURSES</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{activeEnrollments.length}</div>
                    </div>
                    <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>AVG PROGRESS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{totalProgress}%</div>
                    </div>
                </div>
            </header>

            {/* GENERAL LIVE SESSION NOTIFICATION BANNER */}
            {generalLiveAlert && (
                <section className="general-live-alert" style={{
                    marginBottom: '2.5rem',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    border: '1px solid #3b82f6',
                    borderRadius: '1.25rem',
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            fontSize: '1.5rem',
                            flexShrink: 0
                        }}>
                            📹
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '999px',
                                    backgroundColor: generalLiveAlert.status === 'live' || generalLiveAlert.status === 'ongoing' ? '#ef4444' : '#3b82f6',
                                    color: 'white'
                                }}>
                                    {generalLiveAlert.status === 'live' || generalLiveAlert.status === 'ongoing' ? '🔴 Live Now' : '📢 Platform Live Session'}
                                </span>
                                <span style={{ fontSize: '0.813rem', color: '#94a3b8' }}>
                                    {new Date(generalLiveAlert.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                                {generalLiveAlert.title}
                            </h3>
                            {generalLiveAlert.description && (
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#cbd5e1', maxWidth: '600px' }}>
                                    {generalLiveAlert.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button
                            variant="primary"
                            onClick={() => handleJoinClass(generalLiveAlert.id, true, generalLiveAlert.meeting_url)}
                            style={{
                                backgroundColor: '#3b82f6',
                                border: 'none',
                                fontWeight: 700,
                                padding: '0.75rem 1.5rem',
                                boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
                            }}
                        >
                            {generalLiveAlert.status === 'live' || generalLiveAlert.status === 'ongoing' ? 'Join Live Room Now →' : 'View Session Room →'}
                        </Button>
                    </div>
                </section>
            )}

            {/* BATCH ALERTS: Limited Slots */}
            {upcomingCohorts.length > 0 && (
                <section className="batch-alert" style={{ marginBottom: '3rem', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', color: '#f97316' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0L20 9l-3-3-11 11Z"></path><path d="m15 3 3 3"></path><path d="m10 18 3 3"></path></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#9a3412', fontWeight: 700, marginBottom: '0.25rem' }}>Limited Batch Slots Available!</h4>
                        <p style={{ color: '#c2410c', fontSize: '0.9rem' }}>
                            New mentored batches for <strong>{upcomingCohorts[0].course?.title}</strong> are starting soon. Join now to get live mentorship!
                        </p>
                    </div>
                    <Link href={`/student/courses/${upcomingCohorts[0].course?.id}`}>
                        <Button style={{ backgroundColor: '#f97316', border: 'none' }}>Secure My Spot →</Button>
                    </Link>
                </section>
            )}

            {/* SCHEDULED CLASSES: Prominent Section */}
            {myClasses.length > 0 && (
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}><path d="m22 8-6 4 6 4V8Z"></path><rect x="2" y="6" width="14" height="12" rx="2" ry="2"></rect></svg>
                        Your Scheduled Live Sessions & Classes
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                        {myClasses.map(cls => {
                            const startTime = new Date(cls.scheduled_at).getTime();
                            const now = new Date().getTime();
                            // Show as live if instructor marked it 'ongoing'/'live' OR if we are within 2 hours of the start time AND NOT completed
                            const isLive = cls.status === 'ongoing' || cls.status === 'live' || (cls.status !== 'completed' && now >= startTime && now <= startTime + (2 * 60 * 60 * 1000));
                            const isExternal = cls.meeting_url && cls.meeting_url !== 'internal_platform_room' && cls.meeting_url.startsWith('http');
                            
                            return (
                                <LightCard key={cls.id} style={{ 
                                    padding: '1.5rem', border: isLive ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                    display: 'flex', flexDirection: 'column', gap: '1rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            {isLive && <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white', backgroundColor: '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.5rem', animation: 'pulse 2s infinite' }}>LIVE NOW</span>}
                                            <h3 style={{ fontWeight: 800, color: '#1e293b' }}>{cls.title}</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                    {cls.isGlobalLiveClass ? (cls.course_id ? `🎓 Course: ${cls.course?.title || 'Course Live'}` : '🌐 Platform Session') : `👥 Batch: ${cls.cohort?.name}`}
                                                </span>
                                                {isExternal && (
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                        🔗 Google Meet / Zoom
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6' }}>
                                                {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WAT
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {new Date(cls.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    {isLive ? (
                                        <Button onClick={() => handleJoinClass(cls.id, cls.isGlobalLiveClass, cls.meeting_url)} style={{ width: '100%', backgroundColor: isExternal ? '#2563eb' : '#ef4444' }}>
                                            {isExternal ? '▶ Join via Google Meet / Zoom' : '▶ Join Live Room'}
                                        </Button>
                                    ) : cls.recording_url ? (
                                        <a href={cls.recording_url} target="_blank" style={{ textDecoration: 'none' }}>
                                            <Button style={{ width: '100%', backgroundColor: '#7c3aed' }}>🎥 Watch Recording</Button>
                                        </a>
                                    ) : (
                                        <Button variant="outline" disabled style={{ width: '100%', opacity: 0.6 }}>
                                            {cls.status === 'completed' ? 'Session Ended' : `Starts at ${new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                        </Button>
                                    )}
                                </LightCard>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ANNOUNCEMENTS: New Section */}
            {announcements.length > 0 && (
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        Instructor Announcements
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {announcements.map(ann => (
                            <LightCard key={ann.id} style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{ann.title}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }} dangerouslySetInnerHTML={{ __html: ann.content }} />
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                    — {ann.instructor?.full_name || 'Instructor'}
                                </div>
                            </LightCard>
                        ))}
                    </div>
                </section>
            )}

            {/* HERO: Continue Learning (Vibrant Card) */}
            {heroCourse ? (
                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem' }}>Jump Back In</h2>
                    <div className="hero-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr',
                        backgroundColor: 'white',
                        borderRadius: '2rem',
                        overflow: 'hidden',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
                        minHeight: '320px'
                    }}>
                        {/* Left Side: Content */}
                        <div className="hero-content" style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{
                                alignSelf: 'flex-start',
                                padding: '0.35rem 1rem',
                                borderRadius: '99px',
                                backgroundColor: '#EFF6FF',
                                color: '#3B82F6',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                marginBottom: '1.5rem',
                                letterSpacing: '0.05em'
                            }}>
                                IN PROGRESS
                            </span>
                            <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: 1.1 }}>
                                {heroCourse.course?.title || heroCourse.cohort?.name || 'Assigned Batch'}
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '90%' }}>
                                {heroCourse.course?.description || 'Exclusive instructor-led live learning sessions.'}
                            </p>

                            <div className="hero-action-row" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <Link href={heroCourse.course_id ? `/student/courses/${heroCourse.course_id}${heroCourse.cohort_id ? `?cohortId=${heroCourse.cohort_id}` : ''}` : (heroCourse.cohort_id ? `/student/courses/${heroCourse.cohort_id}` : `/student/live-classes`)}>
                                    <Button style={{
                                        padding: '1rem 2.5rem',
                                        borderRadius: '1rem',
                                        fontSize: '1rem',
                                        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                                    }}>
                                        Resume Course →
                                    </Button>
                                </Link>
                                <div style={{ flex: 1, maxWidth: '200px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
                                        <span>Progress</span>
                                        <span>{heroCourse.progress}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '99px' }}>
                                        <div style={{ width: `${heroCourse.progress}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '99px' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Image/Graphics */}
                        <div className="hero-image" style={{
                            backgroundColor: '#6366f1',
                            backgroundImage: `url(${ (heroCourse?.course as any)?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '200px',
                                height: '200px',
                                background: 'linear-gradient(135deg, #60A5FA, #A78BFA)',
                                borderRadius: '40px',
                                transform: 'rotate(-10deg)',
                                boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '5rem',
                                color: 'white'
                            }}>
                                ▶
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section style={{ marginBottom: '4rem' }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '2rem',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5rem 2rem',
                        textAlign: 'center',
                        color: 'white',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        {/* Decorative background elements */}
                        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(30,41,59,0) 70%)', borderRadius: '50%' }}></div>
                        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(30,41,59,0) 70%)', borderRadius: '50%' }}></div>
                        
                        <div style={{ zIndex: 1, maxWidth: '600px' }}>
                            <div style={{
                                width: '80px', height: '80px', margin: '0 auto 2rem auto',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.5rem', transform: 'rotate(-10deg)', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)'
                            }}>🚀</div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Welcome to Privailers!</h2>
                            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                                You are just one step away from transforming your career. Explore our premium courses and live mentorship cohorts to get started.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Link href="/courses">
                                    <Button style={{
                                        backgroundColor: '#3b82f6', border: 'none', color: 'white', padding: '1rem 2.5rem', borderRadius: '1rem', fontSize: '1.1rem', fontWeight: 700, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
                                    }}>Explore Catalog →</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* LIBRARY GRID */}
            {otherEnrollments.length > 0 && (
                <div style={{ marginBottom: '5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem' }}>Your Library</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {otherEnrollments.map(e => {
                            const eTarget = e.course_id 
                                ? `/student/courses/${e.course_id}${e.cohort_id ? `?cohortId=${e.cohort_id}` : ''}`
                                : (e.cohort_id ? `/student/courses/${e.cohort_id}` : '/student/live-classes');
                            return (
                                <Link href={eTarget} key={e.id} style={{ textDecoration: 'none' }}>
                                    <LightCard style={{
                                    height: '100%',
                                    padding: '0',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer'
                                }}
                                    className="hover:shadow-lg hover:-translate-y-1" // Tailwind utility for hover if available, else style handles via props? 
                                // Since we use inline mostly, we can't easily add hover transform without CSS class or state.
                                // We'll stick to simple static beauty.
                                >
                                    <div style={{ height: '140px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                        <CourseIcon title={e.course?.title || 'Course'} size="md" />
                                    </div>
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{e.course?.title || e.cohort?.name || 'Assigned Batch'}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                            {e.course?.description?.slice(0, 60) || 'Exclusive mentored learning sessions.'}...
                                        </p>
                                        <div style={{ marginTop: 'auto' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                <span>Progress</span>
                                                <span>{e.progress}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '99px' }}>
                                                <div style={{ width: `${e.progress}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '99px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </LightCard>
                            </Link>
                        );
                    })}
                    </div>
                </div>
            )}

            {/* CROSS-SELL WIDGET: Upcoming Mentorship Cohorts */}
            {upcomingCohorts.length > 0 && (
                <div style={{ marginBottom: '5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#334155' }}>🔥 Upcoming Mentorship Cohorts</h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Instructor-Led Premium Sessions</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {upcomingCohorts.map(cohort => (
                            <div key={cohort.id} className="cohort-card-grid" style={{ 
                                display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center',
                                backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                        <span style={{ padding: '0.35rem 1rem', borderRadius: '99px', backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '0.75rem', fontWeight: 800 }}>LIVE COHORT</span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                            Starts: {new Date(cohort.scheduled_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                                        {cohort.course?.title}
                                    </h3>
                                    <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                        {cohort.course?.description}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        Mentored by <span style={{ fontWeight: 700 }}>{cohort.course?.instructor?.full_name || 'Expert Instructor'}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Link href={`/student/courses/${cohort.course?.id}`} style={{ display: 'inline-block', width: '100%' }}>
                                        <Button variant="primary" size="lg" style={{ boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)', width: '100%', justifyContent: 'center' }}>
                                            Join Cohort →
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* EXPLORE SECTION */}
            {availableCourses.length > 0 && (
                <section>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155', marginBottom: '1.5rem' }}>Your Learning Journey</h2>
                    <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                        {availableCourses.map(course => (
                            <LightCard key={course.id} style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ height: '160px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <CourseIcon title={course.title} size="md" />
                                </div>
                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 800,
                                            color: course.tier === 'paid' ? '#B45309' : '#047857',
                                            padding: '0.35rem 1rem', borderRadius: '99px',
                                            backgroundColor: course.tier === 'paid' ? '#FEF3C7' : '#D1FAE5',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {course.tier === 'paid' ? 'PREMIUM' : 'FREE DEMO'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>{course.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem', flex: 1, lineHeight: 1.6 }}>{course.description}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>{course.tier === 'paid' ? `₦${course.price?.toLocaleString()}` : 'Free'}</span>
                                        <Link href={`/student/courses/${course.id}`}>
                                            <button style={{
                                                background: 'transparent',
                                                border: '1px solid #cbd5e1',
                                                color: '#475569',
                                                padding: '0.6rem 1.2rem',
                                                borderRadius: '0.75rem',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                transition: 'background 0.2s'
                                            }}>
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </LightCard>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
