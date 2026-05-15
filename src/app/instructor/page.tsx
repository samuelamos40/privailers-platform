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

        const fetchInstructorData = async () => {
            // 1. Fetch Courses
            const { data: myCourses } = await supabase
                .from('courses')
                .select('id')
                .eq('instructor_id', user.id);
            const courseIds = myCourses?.map(c => c.id) || [];

            // 2. Fetch Cohorts
            const { data: myCohortsData } = await supabase
                .from('cohorts')
                .select('id, name, status')
                .eq('instructor_id', user.id);
            const cohortIds = myCohortsData?.map(c => c.id) || [];
            const activeCohortsCount = (myCohortsData || []).filter(c => c.status !== 'completed').length;

            // 3. Fetch Students (Total unique enrollments)
            let studentsCount = 0;
            const filters = [];
            if (courseIds.length > 0) filters.push(`course_id.in.(${courseIds.join(',')})`);
            if (cohortIds.length > 0) filters.push(`cohort_id.in.(${cohortIds.join(',')})`);
            
            if (filters.length > 0) {
                const { count, error: countError } = await supabase
                    .from('enrollments')
                    .select('*', { count: 'exact', head: true })
                    .or(filters.join(','));
                
                if (countError) console.error("Enrollment Query Error:", countError);
                studentsCount = count || 0;
            }

            setStats({
                myCoursesCount: courseIds.length,
                myStudentsCount: studentsCount,
                activeCohortsCount: activeCohortsCount
            });

            // Fetch Upcoming Cohort Classes
            if (cohortIds.length > 0) {
                const { data: upcoming } = await supabase
                    .from('cohort_classes')
                    .select('*, cohorts(name)')
                    .in('cohort_id', cohortIds)
                    .gte('scheduled_at', new Date().toISOString())
                    .order('scheduled_at', { ascending: true })
                    .limit(5);

                if (upcoming) setUpcomingClasses(upcoming);
            }
            
            // Fetch My Cohorts (for the students filter below)
            setMyCohorts(myCohortsData || []);

            // Fetch My Students
            if (courseIds.length > 0 || cohortIds.length > 0) {
                const query = supabase
                    .from('enrollments')
                    .select(`
                        id, progress, status, enrolled_at, cohort_id,
                        user:users(full_name, email),
                        course:courses(title)
                    `);
                
                const studentFilters = [];
                if (courseIds.length > 0) studentFilters.push(`course_id.in.(${courseIds.join(',')})`);
                if (cohortIds.length > 0) studentFilters.push(`cohort_id.in.(${cohortIds.join(',')})`);

                const { data: students, error: studentError } = await query.or(studentFilters.join(','));
                
                if (studentError) console.error("Students Fetch Error:", studentError);
                setMyStudents(students || []);
            }
            
            setLoading(false);
        };
        fetchInstructorData();
    }, [user]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Instructor Dashboard</h1>
                <Link href="/instructor/cohorts">
                    <Button variant="primary">+ Manage Batches/Cohorts</Button>
                </Link>
            </div>

            {loading ? (
                <div style={{ color: '#64748b', padding: '2rem 0' }}>Loading your dashboard...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
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
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upcoming Cohort Sessions</h2>
                                <a href="/instructor/live-classes" style={{ fontSize: '0.875rem', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600 }}>View Calendar &rarr;</a>
                            </div>
                            
                            <div className="table-container">
                                <table className="table-responsive" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cohort</th>
                                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Topic</th>
                                        <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingClasses.length > 0 ? (
                                        upcomingClasses.map((session) => (
                                            <tr key={session.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: 500, color: '#334155' }}>{(session.cohorts as any)?.name || 'Unknown Cohort'}</td>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Active Student Roster</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
