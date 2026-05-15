"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Enrollment, Course } from '@/lib/supabase';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import CourseIcon from '@/components/ui/CourseIcon';

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

    useEffect(() => {
        if (user) {
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

        // Fetch Classes for enrolled cohorts
        const myBatchIds = userEnrollments.map(e => e.cohort_id).filter(Boolean);
        const enrolledCourseIdsArray = Array.from(new Set(userEnrollments.map(e => e.course_id)));
        
        let allMyClasses: any[] = [];
        
        if (myBatchIds.length > 0) {
            const { data: classData } = await supabase
                .from('cohort_classes')
                .select('*, cohort:cohorts(name)')
                .in('cohort_id', myBatchIds);
            
            if (classData) allMyClasses = [...allMyClasses, ...classData];
        }

        // Fetch Global/Course/Cohort live_classes
        let orQueryParts = ['and(course_id.is.null,cohort_id.is.null)'];
        if (myBatchIds.length > 0) orQueryParts.push(`cohort_id.in.(${myBatchIds.join(',')})`);
        if (enrolledCourseIdsArray.length > 0) orQueryParts.push(`course_id.in.(${enrolledCourseIdsArray.join(',')})`);

        const { data: globalClasses } = await supabase
            .from('live_classes')
            .select('*, course:courses(title), cohort:cohorts(name)')
            .or(orQueryParts.join(','));

        if (globalClasses) {
            const normalizedGlobal = globalClasses.map(c => ({
                ...c,
                title: c.course_id ? `[Course] ${c.title}` : c.cohort_id ? `[Cohort] ${c.title}` : `[General] ${c.title}`,
                cohort: c.cohort || { name: c.course?.title || 'Platform Event' },
                isGlobalLiveClass: true
            }));
            allMyClasses = [...allMyClasses, ...normalizedGlobal];
        }

        // Filter and sort the combined classes
        setMyClasses(allMyClasses
            .filter(c => ['scheduled', 'ongoing', 'live'].includes(c.status) || (c.status === 'completed' && c.recording_url))
            .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
            .slice(0, 5)
        );

        const allCourses = coursesResponse.data || [];
        if (allCourses.length > 0) {
            const enrolledCourseIds = new Set(userEnrollments.map(e => e.course_id));
            setAvailableCourses(allCourses.filter(c => !enrolledCourseIds.has(c.id)));
            const activeCohorts = liveResponse.data || [];
            if (activeCohorts.length > 0) {
                setUpcomingCohorts(activeCohorts.filter((c: any) => !enrolledCourseIds.has(c.course?.id)));
            }
        }
        setAnnouncements(announcementResponse.data || []);
        setLoading(false);
    };

    const handleJoinClass = async (classId: string, isGlobalLiveClass?: boolean) => {
        if (!user) return;
        
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <div style={{ height: '40px', width: '300px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 2s infinite' }}></div>
            <div style={{ height: '350px', width: '100%', backgroundColor: '#ffffff', borderRadius: '2rem', border: '1px solid #e2e8f0' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                <div style={{ height: '200px', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
                <div style={{ height: '200px', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
                <div style={{ height: '200px', backgroundColor: '#ffffff', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
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
            padding: '3rem',
        }}>
            <style jsx>{`
                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 1.5rem !important;
                    }
                    .dashboard-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 1.5rem !important;
                        margin-bottom: 2rem !important;
                    }
                    .stats-pill {
                        width: 100% !important;
                        justify-content: space-between !important;
                        padding: 1rem 1.5rem !important;
                    }
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .hero-content {
                        padding: 2rem !important;
                    }
                    .hero-image {
                        height: 200px !important;
                    }
                    .batch-alert {
                        flex-direction: column !important;
                        text-align: center !important;
                    }
                    .batch-alert div {
                        font-size: 1.5rem !important;
                    }
                    .courses-grid {
                        grid-template-columns: 1fr !important;
                    }
                    h1 {
                        font-size: 1.8rem !important;
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
                        Your Live Batch Sessions
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                        {myClasses.map(cls => {
                            const startTime = new Date(cls.scheduled_at).getTime();
                            const now = new Date().getTime();
                            // Show as live if instructor marked it 'ongoing'/'live' OR if we are within 2 hours of the start time AND NOT completed
                            const isLive = cls.status === 'ongoing' || cls.status === 'live' || (cls.status !== 'completed' && now >= startTime && now <= startTime + (2 * 60 * 60 * 1000));
                            
                            return (
                                <LightCard key={cls.id} style={{ 
                                    padding: '1.5rem', border: isLive ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                    display: 'flex', flexDirection: 'column', gap: '1rem'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            {isLive && <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white', backgroundColor: '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.5rem', animation: 'pulse 2s infinite' }}>LIVE NOW</span>}
                                            <h3 style={{ fontWeight: 800, color: '#1e293b' }}>{cls.title}</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Batch: {cls.cohort?.name}</p>
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
                                        <Button onClick={() => handleJoinClass(cls.id, cls.isGlobalLiveClass)} style={{ width: '100%', backgroundColor: '#ef4444' }}>Join Live Room →</Button>
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

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <Link href={heroCourse.course_id ? `/student/courses/${heroCourse.course_id}` : `/student/live-classes`}>
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
                            backgroundImage: `url(${heroCourse?.course?.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'})`,
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
                        {otherEnrollments.map(e => (
                            <Link href={e.course?.id ? `/student/courses/${e.course.id}` : '#'} key={e.id} style={{ textDecoration: 'none' }}>
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
                        ))}
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
                            <div key={cohort.id} style={{ 
                                display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center',
                                backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ padding: '0.35rem 1rem', borderRadius: '99px', backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '0.75rem', fontWeight: 800 }}>LIVE COHORT</span>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                            Starts: {new Date(cohort.scheduled_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                                        {cohort.course?.title}
                                    </h3>
                                    <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                        {cohort.course?.description}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6366f1' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        Mentored by <span style={{ fontWeight: 700 }}>{cohort.course?.instructor?.full_name || 'Expert Instructor'}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Link href={`/student/courses/${cohort.course?.id}`}>
                                        <Button variant="primary" size="lg" style={{ boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
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
                    <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
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
