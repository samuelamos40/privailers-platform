"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        revenue: 0 
    });
    
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const updateClassStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('live_classes').update({ status: newStatus }).eq('id', id);
        if (error) alert("Error updating status: " + error.message);
        else setUpcomingClasses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    };

    const handleExportData = async () => {
        try {
            const res = await fetch('/api/analytics/pipeline', {
                headers: {
                    'x-pipeline-key': 'privailers_data_secret_2026'
                }
            });
            const json = await res.json();
            
            if (res.ok) {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "privailers_analytics_export_" + new Date().toISOString().split('T')[0] + ".json");
                document.body.appendChild(downloadAnchorNode); 
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            } else {
                alert("Error exporting data: " + json.error);
            }
        } catch (e: any) {
            alert("Error downloading analytics: " + e.message);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            // Get Student Count
            const { count: studentCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');

            // Get Courses Count
            const { count: coursesCount } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true });

            // Calculate Revenue (Sum of all active enrollments joined with courses price)
            const { data: enrollmentsData } = await supabase
                .from('enrollments')
                .select('status, courses(price)')
                .eq('status', 'active');

            let totalRevenue = 0;
            if (enrollmentsData) {
                enrollmentsData.forEach(enrollment => {
                    const price = (enrollment.courses as any)?.price;
                    if (price) {
                        totalRevenue += Number(price);
                    }
                });
            }

            setStats({
                students: studentCount || 0,
                courses: coursesCount || 0,
                revenue: totalRevenue
            });

            // Fetch Recent Activity (Top 5 Enrollments)
            const { data: recent, error: recentError } = await supabase
                .from('enrollments')
                .select(`
                    id, 
                    enrolled_at,
                    user:users(email),
                    course:courses(title)
                `)
                .order('enrolled_at', { ascending: false })
                .limit(5);

            if (recentError) {
                console.error("Error fetching recent activity:", recentError.message || recentError);
            }
            if (recent) setRecentActivity(recent);

            // Fetch Upcoming Live Classes
            const { data: upcoming } = await supabase
                .from('live_classes')
                .select(`
                    id, title, scheduled_at, status, meeting_url,
                    course:courses(title),
                    cohort:cohorts(name)
                `)
                .neq('status', 'completed')
                .order('scheduled_at', { ascending: true })
                .limit(5);

            if (upcoming) setUpcomingClasses(upcoming);
            
            setLoading(false);
        };
        fetchDashboardData();
    }, []);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>Administrator Dashboard</h1>
                <Button 
                    variant="outline" 
                    onClick={handleExportData}
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'white', borderColor: '#cbd5e1' }}
                >
                    <span style={{ fontSize: '1.2rem' }}>📊</span> Export Data (PowerBI/JSON)
                </Button>
            </div>

            {loading ? (
                <div style={{ color: '#64748b', padding: '2rem 0' }}>Loading analytics...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <Card padding="sm">
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Students</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{stats.students}</p>
                        </Card>
                        <Card padding="sm">
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Active Courses</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{stats.courses}</p>
                        </Card>
                        <Card padding="sm">
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Revenue</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>₦{stats.revenue.toLocaleString()}</p>
                        </Card>
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Management Tools</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <Card style={{ textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                <a href="/admin/resources" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                                    <h3 style={{ fontWeight: 600 }}>Manage Resources</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Upload files & guides</p>
                                </a>
                            </Card>
                            <Card style={{ textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                <a href="/admin/assignments" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                                    <h3 style={{ fontWeight: 600 }}>Assignments</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Create & Grade tasks</p>
                                </a>
                            </Card>
                            <Card style={{ textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                <a href="/admin/courses" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
                                    <h3 style={{ fontWeight: 600 }}>Course Editor</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Manage modules & videos</p>
                                </a>
                            </Card>
                            <Card style={{ textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                <a href="/admin/settings" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚙️</div>
                                    <h3 style={{ fontWeight: 600 }}>Settings</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Platform Config</p>
                                </a>
                            </Card>
                        </div>
                    </div>

                        <div className="dashboard-grid-2-1">
                            <Card>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Platform Activity</h2>
                                <div className="table-container">
                                    <table className="table-responsive" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Student</th>
                                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Course Enrolled</th>
                                                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Date</th>
                                            </tr>
                                        </thead>
                                <tbody>
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map((activity) => (
                                            <tr key={activity.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '1rem 0', fontWeight: 500, color: '#334155' }}>{(activity.user as any)?.email || 'Unknown User'}</td>
                                                <td style={{ padding: '1rem 0', color: '#0f172a' }}>{(activity.course as any)?.title || 'Unknown Course'}</td>
                                                <td style={{ padding: '1rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                                                    {new Date(activity.enrolled_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No recent enrollments found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </Card>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upcoming Live Sessions</h2>
                                    <a href="/admin/live-classes" style={{ fontSize: '0.875rem', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 600 }}>View All &rarr;</a>
                                </div>
                                
                                {upcomingClasses.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {upcomingClasses.map((session) => (
                                            <div key={session.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{session.title}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                    {new Date(session.scheduled_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {session.status === 'scheduled' && (
                                                        <Button size="sm" variant="outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => updateClassStatus(session.id, 'live')}>
                                                            Go Live 🔴
                                                        </Button>
                                                    )}
                                                    {session.status === 'live' && (
                                                        <>
                                                            <a href={`/admin/live-classes/room/${session.id}`} style={{ textDecoration: 'none' }}>
                                                                <Button size="sm" variant="primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                                                                    Enter 🎥
                                                                </Button>
                                                            </a>
                                                            <Button size="sm" variant="outline" onClick={() => updateClassStatus(session.id, 'completed')}>
                                                                End Class
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming sessions.</p>
                                )}
                            </Card>

                            <Card>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>System Health</h2>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                        <span>Server Load</span>
                                        <span>24%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px' }}>
                                        <div style={{ width: '24%', height: '100%', backgroundColor: '#10b981', borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                        <span>Database Storage</span>
                                        <span>58%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', backgroundColor: '#eee', borderRadius: '3px' }}>
                                        <div style={{ width: '58%', height: '100%', backgroundColor: '#f59e0b', borderRadius: '3px' }}></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
