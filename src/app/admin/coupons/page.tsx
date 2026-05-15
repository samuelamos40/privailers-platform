"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [formData, setFormData] = useState({
        id: '',
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        expires_at: '',
        max_uses: 100,
        course_id: '',
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, title');
        setCourses(data || []);
    };

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select(`
                *,
                course:courses(title)
            `)
            .order('created_at', { ascending: false });

        if (!error) setCoupons(data || []);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            code: formData.code.toUpperCase(),
            discount_type: formData.discount_type,
            discount_value: formData.discount_value,
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
            max_uses: formData.max_uses,
            course_id: formData.course_id || null,
            is_active: formData.is_active
        };

        if (formData.id) {
            const { error } = await supabase.from('coupons').update(payload).eq('id', formData.id);
            if (error) alert("Error: " + error.message);
            else { alert("Coupon updated!"); setIsFormOpen(false); fetchCoupons(); }
        } else {
            const { error } = await supabase.from('coupons').insert([payload]);
            if (error) alert("Error: " + error.message);
            else { alert("Coupon created!"); setIsFormOpen(false); fetchCoupons(); }
        }
    };

    const handleEdit = (c: any) => {
        setFormData({
            id: c.id,
            code: c.code,
            discount_type: c.discount_type,
            discount_value: parseFloat(c.discount_value),
            expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : '',
            max_uses: c.max_uses,
            course_id: c.course_id || '',
            is_active: c.is_active
        });
        setIsFormOpen(true);
    };

    const toggleStatus = async (id: string, current: boolean) => {
        const { error } = await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
        if (!error) fetchCoupons();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this coupon?")) return;
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) alert("Error deleting coupon: " + error.message);
        else fetchCoupons();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Promo Coupons</h1>
                <Button variant="primary" onClick={() => {
                    setFormData({ id: '', code: '', discount_type: 'percentage', discount_value: 0, expires_at: '', max_uses: 100, course_id: '', is_active: true });
                    setIsFormOpen(true);
                }}>
                    + Create New Coupon
                </Button>
            </div>

            <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {loading ? <p>Loading coupons...</p> : coupons.map(c => (
                        <Card key={c.id} style={{ borderLeft: `6px solid ${c.is_active ? '#059669' : '#94a3b8'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '1px' }}>{c.code}</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₦${c.discount_value} OFF`}
                                        {c.course?.title && <span style={{ display: 'block', color: '#3b82f6', fontWeight: 600 }}>Only for: {c.course.title}</span>}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(c)}>✎ Edit</Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)} style={{ color: '#ef4444' }}>🗑️</Button>
                                </div>
                            </div>
                            
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>
                                <div>Uses: <strong>{c.used_count || 0} / {c.max_uses}</strong></div>
                                <div>Expires: <strong>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</strong></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ 
                                    fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                    backgroundColor: c.is_active ? '#dcfce7' : '#f1f5f9', color: c.is_active ? '#166534' : '#64748b'
                                }}>
                                    {c.is_active ? 'ACTIVE' : 'DISABLED'}
                                </span>
                                <Button size="sm" variant="outline" onClick={() => toggleStatus(c.id, c.is_active)}>
                                    {c.is_active ? 'Disable' : 'Enable'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <Modal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    title={formData.id ? 'Edit Coupon' : 'New Coupon'}
                    footer={null}
                >
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <Input label="Coupon Code" placeholder="e.g. SAVE50" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Discount Type</label>
                            <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} required>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₦)</option>
                            </select>
                        </div>

                        <Input label="Value" type="number" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value === '' ? 0 : parseFloat(e.target.value)})} required />

                        <Input label="Expiration Date (Optional)" type="datetime-local" value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} />

                        <Input label="Max Uses" type="number" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value === '' ? 0 : parseInt(e.target.value)})} required />

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Apply to specific course? (Optional)</label>
                            <select 
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} 
                                value={formData.course_id} 
                                onChange={e => setFormData({...formData, course_id: e.target.value})}
                            >
                                <option value="">-- All Courses --</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <Button variant="primary" type="submit" style={{ flex: 1, justifyContent: 'center' }}>Save Coupon</Button>
                            <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
}
