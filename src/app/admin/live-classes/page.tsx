"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminLiveClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        scheduled_at: '',
        meeting_url: '',
        status: 'scheduled',
        audienceType: 'general',
        course_id: '',
        cohort_id: ''
    });

    useEffect(() => {
        fetchClasses();
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        const { data: coursesData } = await supabase.from('courses').select('id, title');
        const { data: cohortsData } = await supabase.from('cohorts').select('id, name');
        if (coursesData) setCourses(coursesData);
        if (cohortsData) setCohorts(cohortsData);
    };

    const fetchClasses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('live_classes')
            .select(`
                *,
                course:courses(title),
                cohort:cohorts(name)
            `)
            .order('scheduled_at', { ascending: true });

        if (!error && data) {
            setClasses(data);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            title: formData.title,
            description: formData.description,
            scheduled_at: new Date(formData.scheduled_at).toISOString(),
            meeting_url: 'internal_platform_room', // Overriding the external link requirement
            status: formData.status,
            course_id: formData.audienceType === 'course' && formData.course_id ? formData.course_id : null,
            cohort_id: formData.audienceType === 'cohort' && formData.cohort_id ? formData.cohort_id : null
        };

        if (formData.id) {
            const { error } = await supabase.from('live_classes').update(payload).eq('id', formData.id);
            if (error) alert("Error updating: " + error.message);
            else { alert("Updated successfully!"); setIsFormOpen(false); fetchClasses(); }
        } else {
            const { error } = await supabase.from('live_classes').insert([payload]);
            if (error) alert("Error creating: " + error.message);
            else { alert("Created successfully!"); setIsFormOpen(false); fetchClasses(); }
        }
    };

    const handleEdit = (c: any) => {
        let audienceType = 'general';
        if (c.course_id) audienceType = 'course';
        else if (c.cohort_id) audienceType = 'cohort';

        setFormData({
            id: c.id,
            title: c.title,
            description: c.description || '',
            scheduled_at: new Date(c.scheduled_at).toISOString().slice(0, 16), // datetime-local format
            meeting_url: c.meeting_url,
            status: c.status,
            audienceType,
            course_id: c.course_id || '',
            cohort_id: c.cohort_id || ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return;
        const { error } = await supabase.from('live_classes').delete().eq('id', id);
        if (error) alert("Error deleting: " + error.message);
        else fetchClasses();
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('live_classes').update({ status: newStatus }).eq('id', id);
        if (error) alert("Error upadting status: " + error.message);
        else fetchClasses();
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Manage Live Classes</h1>
                <Button variant="primary" onClick={() => {
                    setFormData({ id: '', title: '', description: '', scheduled_at: '', meeting_url: '', status: 'scheduled', audienceType: 'general', course_id: '', cohort_id: '' });
                    setIsFormOpen(true);
                }}>
                    + Schedule New Class
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isFormOpen ? '1fr 400px' : '1fr', gap: '2rem' }}>
                
                {/* LIST OF CLASSES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? (
                        <div>Loading schedule...</div>
                    ) : classes.length === 0 ? (
                        <Card style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                            No live classes scheduled yet.
                        </Card>
                    ) : (classes.map(c => (
                        <Card key={c.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '1.2rem', color: '#0f172a' }}>{c.title}</div>
                                        <span style={{ 
                                            fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase',
                                            backgroundColor: c.status === 'live' ? '#fef2f2' : c.status === 'completed' ? '#f1f5f9' : '#e0f2fe',
                                            color: c.status === 'live' ? '#ef4444' : c.status === 'completed' ? '#64748b' : '#0284c7' 
                                        }}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                        🗓️ {new Date(c.scheduled_at).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                                    </div>
                                    <p style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '1rem' }}>{c.description}</p>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#059669', backgroundColor: '#d1fae5', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                            📹 On-Platform Video
                                        </span>
                                        {c.course_id && (
                                            <span style={{ fontSize: '0.85rem', color: '#8b5cf6', backgroundColor: '#f5f3ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                Course: {c.course?.title}
                                            </span>
                                        )}
                                        {c.cohort_id && (
                                            <span style={{ fontSize: '0.85rem', color: '#ea580c', backgroundColor: '#fff7ed', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                Cohort: {c.cohort?.name}
                                            </span>
                                        )}
                                        {!c.course_id && !c.cohort_id && (
                                            <span style={{ fontSize: '0.85rem', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                                General
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Edit</Button>
                                        <Button size="sm" variant="outline" style={{ borderColor: '#f87171', color: '#ef4444' }} onClick={() => handleDelete(c.id)}>Delete</Button>
                                    </div>
                                    {c.status === 'scheduled' && (
                                        <Button size="sm" variant="primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} onClick={() => updateStatus(c.id, 'live')}>
                                            Go Live Now 🔴
                                        </Button>
                                    )}
                                    {c.status === 'live' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <a href={`/admin/live-classes/room/${c.id}`}>
                                                <Button size="sm" variant="primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                                                    Enter Studio 🎥
                                                </Button>
                                            </a>
                                            <Button size="sm" variant="outline" onClick={() => updateStatus(c.id, 'completed')}>
                                                End Class
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )))}
                </div>

                {/* FORM */}
                {isFormOpen && (
                    <Card style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                            {formData.id ? 'Edit Class' : 'Schedule Class'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input label="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Q&A Session" />
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Description / Agenda</label>
                                <textarea 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit' }}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="What will be covered?"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Audience / Target</label>
                                <select 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                    value={formData.audienceType}
                                    onChange={e => setFormData({...formData, audienceType: e.target.value})}
                                >
                                    <option value="general">General (Open to all)</option>
                                    <option value="course">Specific Course</option>
                                    <option value="cohort">Specific Cohort/Batch</option>
                                </select>
                            </div>
                            
                            {formData.audienceType === 'course' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Select Course</label>
                                    <select 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                        value={formData.course_id}
                                        onChange={e => setFormData({...formData, course_id: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Choose Course --</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                            )}

                            {formData.audienceType === 'cohort' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Select Cohort</label>
                                    <select 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                        value={formData.cohort_id}
                                        onChange={e => setFormData({...formData, cohort_id: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Choose Cohort --</option>
                                        {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <Input label="Date & Time" type="datetime-local" value={formData.scheduled_at} onChange={e => setFormData({...formData, scheduled_at: e.target.value})} required />
                            
                            <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '0.5rem', fontSize: '0.875rem', border: '1px solid #bbf7d0' }}>
                                🔒 A secure on-platform video room will be automatically generated for this class!
                            </div>
                            
                            {formData.id && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                                    <select 
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="live">Live 🔴</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <Button variant="primary" type="submit" style={{ flex: 1, justifyContent: 'center' }}>Save</Button>
                                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}
