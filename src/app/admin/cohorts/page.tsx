"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function AdminCohortManagementPage() {
    const [cohorts, setCohorts] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        course_id: '',
        instructor_id: '',
        start_date: '',
        end_date: '',
        capacity: 50,
        status: 'open'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        
        // 1. Fetch All Courses
        const { data: coursesData } = await supabase.from('courses').select('id, title');
        setCourses(coursesData || []);

        // 2. Fetch All Instructors
        const { data: instData } = await supabase.from('users').select('id, full_name').eq('role', 'instructor');
        setInstructors(instData || []);

        // 3. Fetch All Cohorts
        const { data: cohortsData, error } = await supabase
            .from('cohorts')
            .select(`
                *,
                course:courses(title),
                instructor:users(full_name)
            `)
            .order('created_at', { ascending: false });

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
            instructor_id: formData.instructor_id,
            start_date: formData.start_date,
            end_date: formData.end_date,
            capacity: formData.capacity,
            status: formData.status
        };

        if (formData.id) {
            const { error } = await supabase.from('cohorts').update(payload).eq('id', formData.id);
            if (error) alert("Error: " + error.message);
            else { alert("Cohort updated!"); setIsFormOpen(false); fetchData(); }
        } else {
            const { error } = await supabase.from('cohorts').insert([payload]);
            if (error) alert("Error: " + error.message);
            else { alert("Cohort created!"); setIsFormOpen(false); fetchData(); }
        }
    };

    const handleEdit = (c: any) => {
        setFormData({
            id: c.id,
            name: c.name,
            course_id: c.course_id || '',
            instructor_id: c.instructor_id || '',
            start_date: c.start_date,
            end_date: c.end_date,
            capacity: c.capacity,
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
            alert("Cohort deleted successfully!");
            fetchData();
        } catch (e: any) {
            alert("Error deleting cohort: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Global Batch/Cohort Management</h1>
                <Button variant="primary" onClick={() => {
                    setFormData({ id: '', name: '', course_id: '', instructor_id: '', start_date: '', end_date: '', capacity: 50, status: 'open' });
                    setIsFormOpen(true);
                }}>
                    + Create New Global Batch
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isFormOpen ? '1fr 400px' : '1fr', gap: '2rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? <p>Loading cohorts...</p> : cohorts.length === 0 ? <Card>No cohorts found.</Card> : (
                        cohorts.map(c => (
                            <Card key={c.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.25rem' }}>{c.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.25rem' }}>Course: {c.course?.title}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#059669', marginBottom: '0.5rem' }}>Instructor: {c.instructor?.full_name || 'Unassigned'}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            Timeline: {c.start_date} to {c.end_date}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Edit</Button>
                                        <Button size="sm" variant="ghost" style={{ color: '#ef4444' }} onClick={() => handleDelete(c.id)}>Delete</Button>
                                        <span style={{ 
                                            fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase',
                                             backgroundColor: c.status === 'open' ? '#dcfce7' : '#f1f5f9', color: c.status === 'open' ? '#166534' : '#475569'
                                         }}>{c.status}</span>
                                     </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {isFormOpen && (
                    <Card style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>{formData.id ? 'Edit Batch' : 'New Batch'}</h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input label="Batch Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Course</label>
                                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})}>
                                    <option value="">-- No linked course (Physical/Standalone) --</option>
                                    {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Assigned Instructor</label>
                                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} value={formData.instructor_id} onChange={e => setFormData({...formData, instructor_id: e.target.value})} required>
                                    <option value="" disabled>Select Instructor</option>
                                    {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.full_name}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <Input label="Start Date" type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                                <Input label="End Date" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                            </div>

                            <Input label="Capacity" type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value === '' ? 0 : parseInt(e.target.value)})} required />

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
