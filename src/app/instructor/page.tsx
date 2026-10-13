"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        myCoursesCount: 0,
        myStudentsCount: 0,
        activeCohortsCount: 0,
    });
    
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [myStudents, setMyStudents] = useState<any[]>([]);
    const [myCohorts, setMyCohorts] = useState<any[]>([]);
    const [selectedCohortId, setSelectedCohortId] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const cacheKey = `privailers_instructor_cache_${user.id}`;

        // Stale-while-revalidate: Load cached data immediately for instant dashboard render
        if (typeof window !== 'undefined') {
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed.stats) setStats(parsed.stats);
                    if (parsed.myCohorts) setMyCohorts(parsed.myCohorts);
                    if (parsed.upcomingClasses) setUpcomingClasses(parsed.upcomingClasses);
                    if (parsed.myStudents) setMyStudents(parsed.myStudents);
                    setLoading(false);
                }
            } catch (err) {
                console.warn("Failed to read instructor cache:", err);
            }
        }

        const fetchInstructorData = async () => {
            try {
                // 1 & 2: Fetch Courses and Cohorts in parallel (Stage 1)
                const [coursesRes, cohortsRes] = await Promise.all([
                    supabase
                        .from('courses')
                        .select('id, title')
                        .eq('instructor_id', user.id),
                    supabase
                        .from('cohorts')
                        .select('id, name, status')
                        .eq('instructor_id', user.id)
                ]);

                const myCourses = coursesRes.data || [];
                const courseIds = myCourses.map(c => c.id);
                const myCohortsData = cohortsRes.data || [];
                const cohortIds = myCohortsData.map(c => c.id);
                const activeCohortsCount = myCohortsData.filter(c => c.status !== 'completed').length;

                // Build filters for enrollments
                const filters: string[] = [];
                if (courseIds.length > 0) filters.push(`course_id.in.(${courseIds.join(',')})`);
                if (cohortIds.length > 0) filters.push(`cohort_id.in.(${cohortIds.join(',')})`);

                // Stage 2: Parallel queries for enrollment count, upcoming cohort classes, course live classes, and students
                const nowIso = new Date().toISOString();
                const [countRes, upcomingCohortRes, upcomingLiveRes, studentsRes] = await Promise.all([
                    filters.length > 0
                        ? supabase.from('enrollments').select('*', { count: 'exact', head: true }).or(filters.join(','))
                        : Promise.resolve({ count: 0, error: null }),
                    cohortIds.length > 0
                        ? supabase.from('cohort_classes').select('*, cohorts(name)').in('cohort_id', cohortIds).gte('scheduled_at', nowIso).order('scheduled_at', { ascending: true }).limit(5)
                        : Promise.resolve({ data: [], error: null }),
                    courseIds.length > 0
                        ? supabase.from('live_classes').select('*, course:courses(title)').in('course_id', courseIds).gte('scheduled_at', nowIso).order('scheduled_at', { ascending: true }).limit(5)
                        : Promise.resolve({ data: [], error: null }),
                    filters.length > 0
                        ? supabase.from('enrollments').select(`id, progress, status, enrolled_at, cohort_id, user:users(full_name, email), course:courses(title)`).or(filters.join(','))
                        : Promise.resolve({ data: [], error: null })
                ]);

                const studentsCount = countRes.count || 0;
                const freshStats = {
                    myCoursesCount: courseIds.length,
                    myStudentsCount: studentsCount,
                    activeCohortsCount: activeCohortsCount
                };
                setStats(freshStats);

                // Combine upcoming classes (both cohort sessions and course live sessions)
                const cohortClassesList = (upcomingCohortRes.data || []).map((c: any) => ({
                    ...c,
                    type: 'cohort',
                    contextName: c.cohorts?.name ? `Batch: ${c.cohorts.name}` : 'Cohort'
                }));
                const liveClassesList = (upcomingLiveRes.data || []).map((c: any) => ({
                    ...c,
                    type: 'course_live',
                    contextName: c.course?.title ? `Course: ${c.course.title}` : 'Course Live'
                }));

                const allUpcoming = [...cohortClassesList, ...liveClassesList]
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                    .slice(0, 6);

                setUpcomingClasses(allUpcoming);
                setMyCohorts(myCohortsData);
                const freshStudents = studentsRes.data || [];
                setMyStudents(freshStudents);

                // Update Cache
                if (typeof window !== 'undefined') {
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify({
                            stats: freshStats,
                            myCohorts: myCohortsData,
                            upcomingClasses: allUpcoming,
                            myStudents: freshStudents,
                            cachedAt: Date.now()
                        }));
                    } catch (e) {
                        console.warn("Error saving instructor cache:", e);
                    }
                }
            } catch (err) {
                console.error("Error fetching instructor data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorData();
    }, [user]);

    return (
        <div>
            <div className="portal-header">
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 700, color: '#1e293b', margin: 0 }}>Instructor Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Manage courses, active cohorts, and student progress</p>
                </div>
                <Link href="/instructor/cohorts">
                    <Button variant="primary">+ Manage Batches/Cohorts</Button>
                </Link>
            </div>

            {loading ? (
                <div style={{ color: '#64748b', padding: '2rem 0' }}>Loading your dashboard...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <Card padding="sm">
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>My Courses</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{stats.myCoursesCount}</p>
                        </Card>
                        <Card padding="sm">
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Batches</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>{stats.activeCohortsCount}</p>
                        </Card>
                        <Card padding="sm">
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Enrolled Students</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{stats.myStudentsCount}</p>
                        </Card>
                    </div>

                    <div className="dashboard-grid-2-1">
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upcoming Live Sessions</h2>
                                <a href="/instructor/live-classes" style={{ fontSize: '0.875rem', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600 }}>View Calendar &rarr;</a>
                            </div>
                            
                            <div className="table-container">
                                <table className="table-responsive" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Context</th>
                                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Topic</th>
                                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingClasses.length > 0 ? (
                                        upcomingClasses.map((session) => (
                                            <tr key={session.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: 600, color: '#334155' }}>{session.contextName || (session.cohorts as any)?.name || 'Session'}</td>
                                                <td style={{ padding: '1rem 0', color: '#0f172a' }}>{session.title}</td>
                                                <td style={{ padding: '1rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {new Date(session.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No upcoming live sessions scheduled.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </Card>

                        <Card>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Quick Actions</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <a href="/instructor/courses" style={{ display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
                                    🎓 Manage Course Content
                                </a>
                                <a href="/instructor/assignments" style={{ display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
                                    📝 Grade Student Projects
                                </a>
                                <a href="/instructor/live-classes" style={{ display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
                                    📹 Manage Zoom Links
                                </a>
                            </div>
                        </Card>
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Active Student Roster</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Filter by Batch:</span>
                                    <select 
                                        value={selectedCohortId} 
                                        onChange={e => setSelectedCohortId(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}
                                    >
                                        <option value="all">All Batches</option>
                                        <option value="none">Self-Paced (No Batch)</option>
                                        {myCohorts.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="table-container" style={{ overflowX: 'auto' }}>
                                <table className="table-responsive" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Student</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Course</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Batch</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Progress</th>
                                            <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myStudents
                                            .filter(s => {
                                                if (selectedCohortId === 'all') return true;
                                                if (selectedCohortId === 'none') return !s.cohort_id;
                                                return s.cohort_id === selectedCohortId;
                                            })
                                            .map(s => (
                                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{s.user?.full_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.user?.email}</div>
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{s.course?.title}</td>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: s.cohort_id ? '#3b82f6' : '#64748b' }}>
                                                        {myCohorts.find(c => c.id === s.cohort_id)?.name || 'Self-Paced'}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', width: '60px' }}>
                                                                <div style={{ width: `${s.progress}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '3px' }}></div>
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ 
                                                            fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem',
                                                            backgroundColor: s.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                                            color: s.status === 'active' ? '#166534' : '#64748b'
                                                        }}>
                                                            {s.status?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
