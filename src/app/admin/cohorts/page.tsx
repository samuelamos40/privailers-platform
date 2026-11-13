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
        priceType: 'free' as 'free' | 'paid',
        price: 0,
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
        
        const numericPrice = formData.priceType === 'free' ? 0 : Number(formData.price || 0);

        const payload = {
            name: formData.name,
            course_id: formData.course_id || null,
            instructor_id: formData.instructor_id,
            start_date: formData.start_date,
            end_date: formData.end_date,
            capacity: formData.capacity,
            price: numericPrice,
            status: formData.status,
            updated_at: new Date().toISOString()
        };

        if (formData.id) {
            const { error } = await supabase.from('cohorts').update(payload).eq('id', formData.id);
            if (error) alert("Error: " + error.message);
            else { alert("Cohort updated successfully!"); setIsFormOpen(false); fetchData(); }
        } else {
            const { error } = await supabase.from('cohorts').insert([payload]);
            if (error) alert("Error: " + error.message);
            else { alert("Cohort created successfully!"); setIsFormOpen(false); fetchData(); }
        }
    };

    const handleEdit = (c: any) => {
        const isPaid = c.price && Number(c.price) > 0;
        setFormData({
            id: c.id,
            name: c.name,
            course_id: c.course_id || '',
            instructor_id: c.instructor_id || '',
            start_date: c.start_date,
            end_date: c.end_date,
            capacity: c.capacity,
            priceType: isPaid ? 'paid' : 'free',
            price: isPaid ? Number(c.price) : 0,
            status: c.status || 'open'
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove all student enrollments and class records for this batch.")) return;

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
        <div>
            <div className="portal-header">
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 700, color: '#1e293b', margin: 0 }}>Global Batch/Cohort Management</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Manage cohort schedules, pricing (free or paid), status, and instructors</p>
                </div>
                <Button variant="primary" onClick={() => {
                    setFormData({ 
                        id: '', 
                        name: '', 
                        course_id: '', 
                        instructor_id: '', 
                        start_date: '', 
                        end_date: '', 
                        capacity: 50, 
                        priceType: 'free',
                        price: 0,
                        status: 'open' 
                    });
                    setIsFormOpen(true);
                }}>
                    + Create New Global Batch
                </Button>
            </div>

            <div className={`portal-split-layout ${isFormOpen ? 'open' : ''}`} style={{ display: 'grid', gridTemplateColumns: isFormOpen ? '1fr 400px' : '1fr', gap: '2rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? <p>Loading cohorts...</p> : cohorts.length === 0 ? <Card>No cohorts found.</Card> : (
                        cohorts.map(c => {
                            const isPaid = c.price && Number(c.price) > 0;
                            return (
                                <Card key={c.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ minWidth: '220px', flex: '1 1 220px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '1.2rem', wordBreak: 'break-word' }}>{c.name}</span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    padding: '0.15rem 0.5rem',
                                                    borderRadius: '4px',
                                                    backgroundColor: isPaid ? '#fef3c7' : '#dcfce7',
                                                    color: isPaid ? '#b45309' : '#15803d'
                                                }}>
                                                    {isPaid ? `PAID (₦${Number(c.price).toLocaleString()})` : 'FREE'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.25rem' }}>Course: {c.course?.title || 'Standalone Batch'}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#059669', marginBottom: '0.5rem' }}>Instructor: {c.instructor?.full_name || 'Unassigned'}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                Timeline: {c.start_date} to {c.end_date} &bull; Capacity: {c.capacity} students
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Edit</Button>
                                            <Button size="sm" variant="ghost" style={{ color: '#ef4444' }} onClick={() => handleDelete(c.id)}>Delete</Button>
                                            <span style={{ 
                                                fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '1rem', textTransform: 'uppercase',
                                                backgroundColor: c.status === 'open' ? '#dcfce7' : (c.status === 'full' || c.status === 'active' || c.status === 'closed') ? '#fee2e2' : '#f1f5f9', 
                                                color: c.status === 'open' ? '#166534' : (c.status === 'full' || c.status === 'active' || c.status === 'closed') ? '#991b1b' : '#475569'
                                            }}>
                                                {c.status === 'open' ? '🟢 Open (Registration)' : (c.status === 'full' || c.status === 'active' || c.status === 'closed') ? '🔴 Full / Closed' : c.status}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {isFormOpen && (
                    <Card style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#0f172a' }}>
                            {formData.id ? 'Edit Cohort Batch' : 'Create New Cohort Batch'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input label="Batch Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Data Analysis with PowerBI Bootcamp" />
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Linked Course (Optional)</label>
                                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})}>
                                    <option value="">-- No linked course (Physical/Standalone) --</option>
                                    {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Assigned Instructor</label>
                                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} value={formData.instructor_id} onChange={e => setFormData({...formData, instructor_id: e.target.value})} required>
                                    <option value="" disabled>Select Instructor</option>
                                    {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.full_name}</option>)}
                                </select>
                            </div>

                            {/* Free vs Paid Toggle */}
                            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
                                    Admission Type & Pricing
                                </label>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: formData.priceType === 'paid' ? '0.75rem' : '0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, color: formData.priceType === 'free' ? '#16a34a' : '#475569' }}>
                                        <input
                                            type="radio"
                                            name="priceType"
                                            value="free"
                                            checked={formData.priceType === 'free'}
                                            onChange={() => setFormData({ ...formData, priceType: 'free', price: 0 })}
                                        />
                                        Free (₦0)
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, color: formData.priceType === 'paid' ? '#d97706' : '#475569' }}>
                                        <input
                                            type="radio"
                                            name="priceType"
                                            value="paid"
                                            checked={formData.priceType === 'paid'}
                                            onChange={() => setFormData({ ...formData, priceType: 'paid' })}
                                        />
                                        Paid / Premium Tuition
                                    </label>
                                </div>

                                {formData.priceType === 'paid' && (
                                    <div>
                                        <Input
                                            label="Tuition Price (in NGN ₦)"
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                                            placeholder="e.g. 25000"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Registration / Batch Status */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>
                                    Batch Status
                                </label>
                                <select 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }} 
                                    value={formData.status} 
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="open">🟢 Open (Registration Open on Website)</option>
                                    <option value="full">🔴 Full / Closed (Registration Closed)</option>
                                    <option value="completed">⚫ Completed (Cohort Concluded)</option>
                                </select>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
                                    Selecting "Full / Closed" immediately stops new registrations on the website.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '1rem' }}>
                                <Input label="Start Date" type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                                <Input label="End Date" type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                            </div>

                            <Input label="Max Student Capacity" type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value === '' ? 0 : parseInt(e.target.value)})} required />

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
