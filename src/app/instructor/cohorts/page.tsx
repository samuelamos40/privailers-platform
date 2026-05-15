"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface Cohort {
    id: string;
    name: string;
    course_id?: string;
    start_date: string;
    end_date: string;
    capacity: number;
    price?: number;
    batch_plan?: string;
    status: string;
}

interface CohortClass {
    id: string;
    title: string;
    scheduled_at: string;
    meeting_link?: string;
    assignment_details?: string;
    use_internal_room?: boolean;
}

interface CohortAnnouncement {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

export default function CohortManagementPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isManaging, setIsManaging] = useState(false);
    const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
    const [classes, setClasses] = useState<CohortClass[]>([]);
    const [announcements, setAnnouncements] = useState<CohortAnnouncement[]>([]);
    const [newClass, setNewClass] = useState({ title: '', scheduled_at: '', meeting_link: '', assignment_details: '', use_internal_room: true });
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    const [viewingAttendance, setViewingAttendance] = useState<string | null>(null);
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [batchSummary, setBatchSummary] = useState<any[]>([]);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        course_id: '',
        start_date: '',
        end_date: '',
        capacity: 50,
        price: 0,
        batch_plan: '',
        status: 'open'
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        
        const { data: coursesData } = await supabase
            .from('courses')
            .select('id, title')
            .eq('instructor_id', user?.id);
        
        setCourses(coursesData || []);

        const { data: cohortsData, error } = await supabase
            .from('cohorts')
            .select(`
                *,
                course:courses(title)
            `)
            .eq('instructor_id', user?.id)
            .order('start_date', { ascending: false });

        if (!error) {
            setCohorts(cohortsData || []);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            name: formData.name,
            course_id: formData.course_id || null,
            instructor_id: user?.id,
            start_date: formData.start_date,
            end_date: formData.end_date,
            capacity: formData.capacity,
            price: formData.price,
            batch_plan: formData.batch_plan,
            status: formData.status
        };

        if (formData.id) {
            const { error } = await supabase.from('cohorts').update(payload).eq('id', formData.id);
            if (error) alert("Error updating cohort: " + error.message);
            else { alert("Cohort updated!"); setIsFormOpen(false); fetchData(); }
        } else {
            const { error } = await supabase.from('cohorts').insert([payload]);
            if (error) alert("Error creating cohort: " + error.message);
            else { alert("Cohort created successfully!"); setIsFormOpen(false); fetchData(); }
        }
    };

    const handleEdit = (c: any) => {
        setFormData({
            id: c.id,
            name: c.name,
            course_id: c.course_id || '',
            start_date: c.start_date,
            end_date: c.end_date,
            capacity: c.capacity,
            price: c.price || 0,
            batch_plan: c.batch_plan || '',
            status: c.status
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will also remove all student enrollments and class records for this batch.")) return;

        setLoading(true);
        try {
            const { error } = await supabase.rpc('wipe_cohort', { target_cohort_id: id });
            
            if (error) throw error;
            alert("Cohort and all related data deleted successfully!");
            fetchData();
        } catch (e: any) {
            alert("Error deleting cohort: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleManage = async (cohort: Cohort) => {
        setSelectedCohort(cohort);
        setIsManaging(true);
        
        const { data: classData } = await supabase.from('cohort_classes').select('*').eq('cohort_id', cohort.id).order('scheduled_at', { ascending: true });
        setClasses(classData || []);

        const { data: annData } = await supabase.from('cohort_announcements').select('*').eq('cohort_id', cohort.id).order('created_at', { ascending: false });
        setAnnouncements(annData || []);
    };

    const handleAddClass = async () => {
        if (!selectedCohort) return;
        if (!newClass.title || !newClass.scheduled_at) {
            alert("Please provide both a Title and a Scheduled Date/Time.");
            return;
        }

        if (!newClass.use_internal_room && newClass.meeting_link) {
            try {
                new URL(newClass.meeting_link);
            } catch (_) {
                alert("Please enter a valid URL for the external meeting link (must include http:// or https://).");
                return;
            }
        }

        console.log("Attempting to add class for cohort:", selectedCohort.id);
        console.log("Current User ID:", user?.id);
        console.log("Cohort Instructor ID:", selectedCohort.instructor_id);

        // Convert local datetime-local string to proper ISO with timezone
        const localDate = new Date(newClass.scheduled_at);
        const isoDate = localDate.toISOString();

        console.log("Saving class with date:", isoDate);

        const { error } = await supabase.from('cohort_classes').insert([{
            cohort_id: selectedCohort.id,
            title: newClass.title,
            scheduled_at: isoDate,
            meeting_link: newClass.meeting_link,
            assignment_details: newClass.assignment_details,
            use_internal_room: newClass.use_internal_room
        }]);
        
        if (error) {
            console.error("Full Error Object:", error);
            alert("Error scheduling class: " + (error.message || JSON.stringify(error) || "RLS Policy Denied or Missing Column"));
        } else {
            alert("Class Scheduled!");
            handleManage(selectedCohort);
            setNewClass({ title: '', scheduled_at: '', meeting_link: '', assignment_details: '', use_internal_room: true });
        }
    };

    const handleAddAnnouncement = async () => {
        if (!selectedCohort || !user) return;
        const { error } = await supabase.from('cohort_announcements').insert([{
            cohort_id: selectedCohort.id,
            instructor_id: user.id,
            ...newAnnouncement
        }]);
        if (!error) {
            alert("Announcement Posted & Students Notified!");
            handleManage(selectedCohort);
            setNewAnnouncement({ title: '', content: '' });
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        const { error } = await supabase.from('cohort_announcements').delete().eq('id', id);
        if (!error) {
            handleManage(selectedCohort!);
        } else {
            alert("Error deleting announcement: " + error.message);
        }
    };

    const handleUpdateRecording = async (classId: string) => {
        const url = prompt("Enter the recording URL (Zoom, Google Drive, or Jitsi link):");
        if (url === null) return;
        
        if (url.trim() !== '') {
            try {
                new URL(url);
            } catch (_) {
                alert("Please enter a valid URL (must include http:// or https://).");
                return;
            }
        }
        
        const { error } = await supabase
            .from('cohort_classes')
            .update({ recording_url: url })
            .eq('id', classId);
            
        if (!error) {
            alert("Recording link updated!");
            handleManage(selectedCohort!);
        } else {
            alert("Error updating recording: " + error.message);
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class session? All attendance records for this class will also be removed.")) return;
        const { error } = await supabase.from('cohort_classes').delete().eq('id', id);
        if (!error) {
            handleManage(selectedCohort!);
        } else {
            alert("Error deleting class: " + error.message);
        }
    };

    const handleViewAttendance = async (classId: string) => {
        setViewingAttendance(classId);
        const { data } = await supabase
            .from('cohort_attendance')
            .select('*, student:users(full_name, email)')
            .eq('class_id', classId);
        setAttendanceList(data || []);
    };

    const fetchBatchSummary = async () => {
        if (!selectedCohort) return;
        setIsSummaryOpen(true);
        
        // 1. Get all students in this cohort
        const { data: students } = await supabase
            .from('enrollments')
            .select('user_id, users(full_name, email)')
            .eq('cohort_id', selectedCohort.id);
            
        // 2. Get all classes for this cohort
        const { data: cohortClasses } = await supabase
            .from('cohort_classes')
            .select('id')
            .eq('cohort_id', selectedCohort.id);
            
        const classIds = cohortClasses?.map(c => c.id) || [];
        
        // 3. Get all attendance for these classes
        const { data: allAttendance } = await supabase
            .from('cohort_attendance')
            .select('student_id, class_id')
            .in('class_id', classIds);
            
        // 4. Calculate
        const totalClasses = classIds.length;
        const summary = students?.map(s => {
            const studentAttendance = allAttendance?.filter(a => a.student_id === s.user_id) || [];
            const count = studentAttendance.length;
            const percentage = totalClasses > 0 ? Math.round((count / totalClasses) * 100) : 0;
            return {
                name: (s.users as any)?.full_name || 'Unknown',
                email: (s.users as any)?.email || '',
                attended: count,
                total: totalClasses,
                percentage
            };
        }) || [];
        
        setBatchSummary(summary);
    };

    if (isManaging && selectedCohort) {
        return (
            <div className="manage-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <style jsx>{`
                    @media (max-width: 900px) {
                        .manage-container {
                            padding: 1rem !important;
                        }
                        .content-split {
                            grid-template-columns: 1fr !important;
                            gap: 2rem !important;
                        }
                        .batch-header {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            gap: 1rem !important;
                        }
                    }
                `}</style>
                <button onClick={() => setIsManaging(false)} style={{ marginBottom: '2rem', background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer' }}>← Back to Batches</button>
                
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Manage: {selectedCohort.name}</h1>
                <p style={{ color: '#64748b', marginBottom: '3rem' }}>Track classes, assignments, and announcements for this cohort.</p>

                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={fetchBatchSummary}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '0.6rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                        📊 View Batch Attendance Report
                    </button>
                </div>

                {isSummaryOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.5rem', maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>Batch Attendance Summary</h2>
                                <button onClick={() => setIsSummaryOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Student Name</th>
                                        <th style={{ padding: '1rem' }}>Attendance</th>
                                        <th style={{ padding: '1rem' }}>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchSummary.map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 600 }}>{s.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.email}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{s.attended} / {s.total} sessions</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '0.25rem 0.75rem', 
                                                    borderRadius: '1rem', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 700,
                                                    backgroundColor: s.percentage >= 70 ? '#dcfce7' : '#fee2e2',
                                                    color: s.percentage >= 70 ? '#166534' : '#991b1b'
                                                }}>
                                                    {s.percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {batchSummary.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No students enrolled in this batch yet.</p>}
                        </div>
                    </div>
                )}

                <div className="content-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                    
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>📅 Classes & Assignments</h2>
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Schedule New Class</h3>
                            <input type="text" placeholder="Class Title" value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                            <input type="datetime-local" value={newClass.scheduled_at} onChange={e => setNewClass({...newClass, scheduled_at: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input type="checkbox" checked={newClass.use_internal_room} onChange={e => setNewClass({...newClass, use_internal_room: e.target.checked})} id="useInternal" />
                                <label htmlFor="useInternal" style={{ fontSize: '0.85rem' }}>Use Privailers Platform Classroom</label>
                            </div>
                            
                            {!newClass.use_internal_room && (
                                <input type="text" placeholder="External Link (Zoom/Meet)" value={newClass.meeting_link} onChange={e => setNewClass({...newClass, meeting_link: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                            )}
                            <textarea placeholder="Assignment Details (optional)" value={newClass.assignment_details} onChange={e => setNewClass({...newClass, assignment_details: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', minHeight: '100px' }} />
                            <button onClick={handleAddClass} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700 }}>Schedule Class</button>
                        </div>

                        {classes.map(c => (
                            <div key={c.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', backgroundColor: 'white', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700 }}>{c.title}</div>
                                    <button 
                                        onClick={async () => {
                                            await supabase.from('cohort_classes').update({ status: 'ongoing' }).eq('id', c.id);
                                            router.push(`/classroom/${c.id}`);
                                        }}
                                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '0.4rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Launch Classroom
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span>{new Date(c.scheduled_at).toLocaleString()}</span>
                                    <span style={{ 
                                        fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase',
                                        backgroundColor: c.status === 'completed' ? '#dcfce7' : c.status === 'ongoing' ? '#fee2e2' : '#f1f5f9',
                                        color: c.status === 'completed' ? '#166534' : c.status === 'ongoing' ? '#991b1b' : '#475569'
                                    }}>
                                        {c.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    <button 
                                        onClick={() => handleViewAttendance(c.id)}
                                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.3rem', cursor: 'pointer' }}
                                    >
                                        View Attendance
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleUpdateRecording(c.id)}
                                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '0.3rem', cursor: 'pointer' }}
                                    >
                                        {c.recording_url ? 'Update Recording' : 'Add Recording Link'}
                                    </button>

                                    <button 
                                        onClick={() => handleDeleteClass(c.id)}
                                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.3rem', cursor: 'pointer' }}
                                    >
                                        Delete Session
                                    </button>
                                    {c.meeting_link && <a href={c.meeting_link} target="_blank" style={{ fontSize: '0.7rem', color: '#6366f1', textDecoration: 'none', marginLeft: 'auto' }}>Join External Link</a>}
                                    {c.recording_url && <a href={c.recording_url} target="_blank" style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700, textDecoration: 'none', marginLeft: 'auto' }}>🎥 Watch Recording</a>}
                                </div>

                                {viewingAttendance === c.id && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Student Attendance ({attendanceList.length})</span>
                                            <button onClick={() => setViewingAttendance(null)} style={{ color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>Close</button>
                                        </div>
                                        {attendanceList.length === 0 ? (
                                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No students have joined yet.</p>
                                        ) : (
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                {attendanceList.map((entry, idx) => (
                                                    <li key={idx} style={{ padding: '0.25rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                        {entry.student?.full_name} ({entry.student?.email})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>📢 Batch Announcements</h2>
                        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Post New Update</h3>
                            <input type="text" placeholder="Announcement Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                            <RichTextEditor 
                                placeholder="Write your message to students..." 
                                value={newAnnouncement.content} 
                                onChange={val => setNewAnnouncement({...newAnnouncement, content: val})} 
                                style={{ marginBottom: '1rem' }} 
                            />
                            <button onClick={handleAddAnnouncement} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700 }}>Post Announcement</button>
                        </div>

                        {announcements.map(a => (
                            <div key={a.id} style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid #e2e8f0', position: 'relative' }}>
                                <button 
                                    onClick={() => handleDeleteAnnouncement(a.id)}
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                >
                                    Delete
                                </button>
                                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{a.title}</div>
                                <div style={{ fontSize: '0.9rem', color: '#475569' }} dangerouslySetInnerHTML={{ __html: a.content }} />
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1rem' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container" style={{ padding: '2rem' }}>
            <style jsx>{`
                @media (max-width: 900px) {
                    .main-container {
                        padding: 1rem !important;
                    }
                    .main-header {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 1rem !important;
                    }
                    .batch-card-header {
                        flex-direction: column !important;
                        gap: 1.5rem !important;
                    }
                    .batch-actions {
                        width: 100% !important;
                        flex-direction: column !important;
                    }
                    .split-layout {
                        grid-template-columns: 1fr !important;
                    }
                    .form-sticky {
                        position: static !important;
                    }
                }
            `}</style>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/instructor" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>
                    ← Back to Dashboard
                </Link>
                <div className="main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Manage Batches (Cohorts)</h1>
                    <Button variant="primary" onClick={() => {
                        setFormData({ id: '', name: '', course_id: '', start_date: '', end_date: '', capacity: 50, price: 0, batch_plan: '', status: 'open' });
                        setIsFormOpen(true);
                    }}>
                        + Create New Batch
                    </Button>
                </div>
            </div>

            <div className="split-layout" style={{ display: 'grid', gridTemplateColumns: isFormOpen ? '1fr 400px' : '1fr', gap: '2rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? (
                        <p>Loading batches...</p>
                    ) : cohorts.length === 0 ? (
                        <Card style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            You haven't created any batches yet.
                        </Card>
                    ) : (
                        cohorts.map(c => (
                            <Card key={c.id}>
                                <div className="batch-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{c.name}</span>
                                            <span style={{ 
                                                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase',
                                                backgroundColor: c.status === 'open' ? '#dcfce7' : c.status === 'full' ? '#fee2e2' : '#f1f5f9',
                                                color: c.status === 'open' ? '#166534' : c.status === 'full' ? '#991b1b' : '#475569'
                                            }}>
                                                {c.status}
                                            </span>
                                        </div>
                                        <div style={{ color: '#0369a1', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                            Course: {c.course?.title || 'Standalone'}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                            📅 {new Date(c.start_date).toLocaleDateString()} to {new Date(c.end_date).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                                            👥 Capacity: {c.capacity} students | 💰 Price: ₦{c.price?.toLocaleString() || 'Course Default'}
                                        </div>
                                        {c.batch_plan && (
                                            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '1rem', fontStyle: 'italic', borderLeft: '3px solid #e2e8f0', paddingLeft: '0.75rem' }}>
                                                Plan: {c.batch_plan.length > 100 ? c.batch_plan.substring(0, 100) + '...' : c.batch_plan}
                                            </div>
                                        )}
                                    </div>
                                    <div className="batch-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => handleManage(c)}
                                            style={{ flex: 1, padding: '0.5rem', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            Manage Classroom
                                        </button>
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Edit</Button>
                                        <Button size="sm" variant="outline" style={{ color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => handleDelete(c.id)}>Delete</Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {isFormOpen && (
                    <Card className="form-sticky" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                            {formData.id ? 'Edit Batch' : 'New Batch'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input 
                                label="Batch Name" 
                                placeholder="e.g. January 2026 Professional" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                required 
                            />
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Course</label>
                                <select 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                    value={formData.course_id}
                                    onChange={e => setFormData({...formData, course_id: e.target.value})}
                                >
                                    <option value="">-- No linked course (Physical/Standalone) --</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Input label="Start Date" type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                                <Input label="End Date" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                            </div>

                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Input label="Capacity" type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value === '' ? 0 : parseInt(e.target.value)})} required />
                                <Input label="Batch Price (₦)" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})} placeholder="Optional" />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Batch Curriculum / Live Plan</label>
                                <textarea 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', height: '100px' }}
                                    value={formData.batch_plan}
                                    onChange={e => setFormData({...formData, batch_plan: e.target.value})}
                                    placeholder="Describe the personalized schedule for this batch..."
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                                <select 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="open">Open for Enrollment</option>
                                    <option value="full">Full (Waitlist Only)</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <Button variant="primary" type="submit" style={{ flex: 1, justifyContent: 'center' }}>Save Batch</Button>
                                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}
