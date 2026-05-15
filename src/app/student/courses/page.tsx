"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Enrollment, Course } from '@/lib/supabase';
import Link from 'next/link';

// Reusing the Premium LightCard from Dashboard (inline for now to avoid circular deps if not in shared)
const LightCard = ({ children, style, className, onClick }: { children: React.ReactNode, style?: React.CSSProperties, className?: string, onClick?: () => void }) => (
    <div onClick={onClick} className={className} style={{
        backgroundColor: '#ffffff',
        borderRadius: '1.5rem',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.01)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style
    }}>
        {children}
    </div>
);

type EnrollmentWithCourse = Enrollment & {
    course: Course;
};

const GRADIENTS = [
    'linear-gradient(135deg, #6366f1, #a855f7)', // Indigo/Purple
    'linear-gradient(135deg, #3b82f6, #06b6d4)', // Blue/Cyan
    'linear-gradient(135deg, #f59e0b, #ef4444)', // Amber/Red
    'linear-gradient(135deg, #10b981, #3b82f6)', // Emerald/Blue
    'linear-gradient(135deg, #ec4899, #8b5cf6)', // Pink/Violet
    'linear-gradient(135deg, #f97316, #f43f5e)', // Orange/Rose
];

const getCourseStyle = (id: string, title: string) => {
    // Simple hash to pick a stable gradient
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % GRADIENTS.length;
    return {
        background: GRADIENTS[index],
        initials: title.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    };
};

export default function StudentCoursesPage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
    const [allCohorts, setAllCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'my-courses' | 'live-batches'>('my-courses');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        if (user) {
            fetchEnrollments();
        }
    }, [user]);

    const fetchEnrollments = async () => {
        setLoading(true);
        // Fetch My Enrollments
        const { data: eData } = await supabase
            .from('enrollments')
            .select(`*, course:courses(*), cohort:cohorts(*)`)
            .eq('user_id', user?.id)
            .order('last_accessed', { ascending: false });
        
        setEnrollments((eData as any[]) || []);

        // Fetch All Open Cohorts
        const { data: cData } = await supabase
            .from('cohorts')
            .select(`*, course:courses(id, title, thumbnail_url, price)`)
            .eq('status', 'open');
        
        setAllCohorts(cData || []);
        setLoading(false);
    };

    const filteredEnrollments = enrollments.filter(enrollment => {
        const title = enrollment.course?.title || enrollment.cohort?.name || "";
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'completed' ? enrollment.progress === 100 :
                    enrollment.progress < 100;

        return matchesSearch && matchesFilter;
    });

    if (loading) return (
        <div style={{ padding: '3rem', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <div style={{ height: '40px', width: '200px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginBottom: '2rem', animation: 'pulse 2s infinite' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '300px', backgroundColor: 'white', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}></div>
                ))}
            </div>
            <style jsx>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '3rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.03em' }}>My Courses</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage and track your learning progress.</p>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                        <button 
                            onClick={() => setActiveTab('my-courses')}
                            style={{ padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'my-courses' ? '3px solid #3b82f6' : '3px solid transparent', color: activeTab === 'my-courses' ? '#3b82f6' : '#64748b', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            My Enrolled Courses
                        </button>
                        <button 
                            onClick={() => setActiveTab('live-batches')}
                            style={{ padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'live-batches' ? '3px solid #3b82f6' : '3px solid transparent', color: activeTab === 'live-batches' ? '#3b82f6' : '#64748b', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            Live Batches
                        </button>
                    </div>

                    {activeTab === 'my-courses' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                            {/* Search */}
                            <div style={{ position: 'relative', flex: 1, minWidth: '300px', maxWidth: '500px' }}>
                                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#94a3b8' }}>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search your courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Filters */}
                            <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '0.25rem', borderRadius: '0.75rem' }}>
                                {(['all', 'active', 'completed'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', textTransform: 'capitalize',
                                            backgroundColor: filter === f ? 'white' : 'transparent',
                                            color: filter === f ? '#0f172a' : '#64748b'
                                        }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                {activeTab === 'my-courses' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                        {filteredEnrollments.map(enrollment => {
                            const itemId = enrollment.course?.id || enrollment.cohort?.id || enrollment.id;
                            const itemTitle = enrollment.course?.title || enrollment.cohort?.name || "Assigned Batch";
                            const style = getCourseStyle(itemId, itemTitle);
                            return (
                                <Link href={enrollment.course_id ? `/student/courses/${enrollment.course_id}${enrollment.cohort_id ? `?cohortId=${enrollment.cohort_id}` : ''}` : (enrollment.cohort_id ? `/student/courses/${enrollment.cohort?.course_id}?cohortId=${enrollment.cohort_id}` : `/student/live-classes`)} key={enrollment.id} style={{ textDecoration: 'none' }}>
                                    <LightCard
                                        style={{ height: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                    >
                                        {/* Card Header / Premium Gradient Cover */}
                                        <div style={{
                                            height: '180px',
                                            background: style.background,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                fontSize: '3.5rem',
                                                fontWeight: 900,
                                                color: 'white',
                                                opacity: 0.9,
                                                letterSpacing: '-0.05em'
                                            }}>
                                                {style.initials}
                                            </div>

                                            {/* Status Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                right: '1rem',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '99px',
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(4px)',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}>
                                                {enrollment.progress === 100 ? 'COMPLETED' : `${enrollment.progress}% DONE`}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                                                {enrollment.course?.title || enrollment.cohort?.name || 'Live Batch Access'}
                                            </h2>
                                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>
                                                {enrollment.course?.description?.slice(0, 100) || "Access exclusive mentored sessions and live curriculum updates."}...
                                            </p>

                                            {/* Progress Bar */}
                                            <div style={{ marginTop: 'auto' }}>
                                                <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${enrollment.progress}%`,
                                                        height: '100%',
                                                        background: enrollment.progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                                                        borderRadius: '99px'
                                                    }}></div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                                        {enrollment.progress === 100 ? 'All modules finished' : 'Keep going!'}
                                                    </span>
                                                    <button style={{
                                                        color: enrollment.progress === 100 ? '#166534' : '#2563eb',
                                                        fontWeight: 700,
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {enrollment.progress === 0 && 'Start Course →'}
                                                        {enrollment.progress > 0 && enrollment.progress < 100 && 'Resume →'}
                                                        {enrollment.progress === 100 && 'Review Course ↺'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </LightCard>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* LIVE BATCHES EXPLORER TAB */
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                        {allCohorts.length > 0 ? (
                            allCohorts.map(cohort => {
                                const style = getCourseStyle(cohort.id, cohort.name);
                                return (
                                    <LightCard key={cohort.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ height: '140px', background: style.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', opacity: 0.9 }}>{style.initials}</div>
                                        </div>
                                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{cohort.name}</h3>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '1rem' }}>OPEN</span>
                                            </div>
                                            <p style={{ color: '#0369a1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Course: {cohort.course?.title}</p>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                                                📅 Starts: {new Date(cohort.start_date).toLocaleDateString()}
                                                <br />
                                                👥 Slots: {cohort.capacity} Available
                                            </div>
                                            
                                            {cohort.batch_plan && (
                                                <p style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '0.4rem' }}>
                                                    " {cohort.batch_plan.slice(0, 80)}... "
                                                </p>
                                            )}

                                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 700, color: '#0f172a' }}>₦{cohort.price?.toLocaleString() || cohort.course?.price?.toLocaleString() || '0'}</span>
                                                <Link href={cohort.course_id ? `/student/courses/${cohort.course_id}?cohortId=${cohort.id}` : `/student/live-classes?cohortId=${cohort.id}`}>
                                                    <button style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                                                        Join Batch →
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </LightCard>
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
                                <p style={{ color: '#64748b' }}>No live batches are currently open for registration.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
