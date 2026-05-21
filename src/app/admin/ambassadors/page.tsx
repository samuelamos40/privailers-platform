"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function AdminAmbassadorsPage() {
    const [ambassadors, setAmbassadors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        id: '',
        full_name: '',
        email: '',
        phone: '',
        referral_code: '',
        commission_rate: 10,
        discount_value: 5,
        is_active: true
    });

    useEffect(() => {
        fetchAmbassadors();
    }, []);

    const fetchAmbassadors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ambassadors')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setAmbassadors(data || []);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            referral_code: formData.referral_code.toUpperCase().replace(/\s/g, ''),
            commission_rate: formData.commission_rate,
            discount_value: formData.discount_value,
            is_active: formData.is_active
        };

        if (formData.id) {
            const { error } = await supabase.from('ambassadors').update(payload).eq('id', formData.id);
            if (error) alert("Error: " + error.message);
            else { alert("Ambassador updated!"); setIsFormOpen(false); fetchAmbassadors(); }
        } else {
            const { error } = await supabase.from('ambassadors').insert([payload]);
            if (error) {
                if (error.message.includes('duplicate')) alert("Error: This referral code already exists. Choose a unique code.");
                else alert("Error: " + error.message);
            }
            else { alert("Ambassador created!"); setIsFormOpen(false); fetchAmbassadors(); }
        }
    };

    const handleEdit = (a: any) => {
        setFormData({
            id: a.id,
            full_name: a.full_name,
            email: a.email || '',
            phone: a.phone || '',
            referral_code: a.referral_code,
            commission_rate: parseFloat(a.commission_rate),
            discount_value: parseFloat(a.discount_value || 0),
            is_active: a.is_active
        });
        setIsFormOpen(true);
    };

    const toggleStatus = async (id: string, current: boolean) => {
        const { error } = await supabase.from('ambassadors').update({ is_active: !current }).eq('id', id);
        if (!error) fetchAmbassadors();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this ambassador? All their referral records will also be deleted.")) return;
        const { error } = await supabase.from('ambassadors').delete().eq('id', id);
        if (error) alert("Error: " + error.message);
        else fetchAmbassadors();
    };

    const copyLink = (code: string, id: string) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        navigator.clipboard.writeText(`${baseUrl}/register?ref=${code}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const totalReferrals = ambassadors.reduce((sum, a) => sum + (a.total_referrals || 0), 0);
    const totalEarned = ambassadors.reduce((sum, a) => sum + parseFloat(a.total_earned || 0), 0);
    const activeCount = ambassadors.filter(a => a.is_active).length;

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>Ambassadors 🤝</h1>
                    <p style={{ color: '#64748b' }}>Manage influencers & affiliate partners</p>
                </div>
                <Button variant="primary" onClick={() => {
                    setFormData({ id: '', full_name: '', email: '', phone: '', referral_code: '', commission_rate: 10, discount_value: 5, is_active: true });
                    setIsFormOpen(true);
                }}>
                    + Add Ambassador
                </Button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Card style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{ambassadors.length}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Ambassadors</div>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{activeCount}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active</div>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>{totalReferrals}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Referrals</div>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>₦{totalEarned.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Commissions</div>
                </Card>
            </div>

            {/* Ambassador Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {loading ? <p>Loading ambassadors...</p> : ambassadors.length === 0 ? (
                    <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        No ambassadors yet. Click "+ Add Ambassador" to create your first one.
                    </Card>
                ) : ambassadors.map(a => (
                    <Card key={a.id} style={{ borderLeft: `6px solid ${a.is_active ? '#7c3aed' : '#94a3b8'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{a.full_name}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{a.email || 'No email'}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(a)}>✎</Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)} style={{ color: '#ef4444' }}>🗑️</Button>
                            </div>
                        </div>

                        {/* Code + Copy Link */}
                        <div style={{
                            backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem',
                            border: '1px dashed #cbd5e1'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Referral Code</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '2px', color: '#7c3aed' }}>{a.referral_code}</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => copyLink(a.referral_code, a.id)}>
                                {copiedId === a.id ? '✓ Copied!' : '📋 Copy Link'}
                            </Button>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Commission</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2563eb' }}>{a.commission_rate}%</div>
                            </div>
                            <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Student Discount</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{a.discount_value || 0}%</div>
                            </div>
                            <div style={{ backgroundColor: '#faf5ff', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Referrals</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#7c3aed' }}>{a.total_referrals || 0}</div>
                            </div>
                            <div style={{ backgroundColor: '#fffbeb', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Earned</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>₦{parseFloat(a.total_earned || 0).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                backgroundColor: a.is_active ? '#dcfce7' : '#f1f5f9', color: a.is_active ? '#166534' : '#64748b'
                            }}>
                                {a.is_active ? 'ACTIVE' : 'DISABLED'}
                            </span>
                            <Button size="sm" variant="outline" onClick={() => toggleStatus(a.id, a.is_active)}>
                                {a.is_active ? 'Disable' : 'Enable'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={formData.id ? 'Edit Ambassador' : 'New Ambassador'}
                footer={null}
            >
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Input label="Full Name" placeholder="e.g. David Okafor" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                    <Input label="Email (optional)" type="email" placeholder="ambassador@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <Input label="Phone (optional)" placeholder="+234..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />

                    <Input label="Referral Code" placeholder="e.g. DAVE20" value={formData.referral_code}
                        onChange={e => setFormData({...formData, referral_code: e.target.value.toUpperCase().replace(/\s/g, '')})} required />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '-1rem' }}>
                        Students will use this code during registration/checkout. Must be unique.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Input label="Commission Rate (%)" type="number" value={formData.commission_rate}
                                onChange={e => setFormData({...formData, commission_rate: parseFloat(e.target.value) || 0})} required />
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '-0.5rem' }}>% of each sale the ambassador earns</p>
                        </div>
                        <div>
                            <Input label="Student Discount (%)" type="number" value={formData.discount_value}
                                onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})} required />
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '-0.5rem' }}>% discount for students using this code</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <Button variant="primary" type="submit" style={{ flex: 1, justifyContent: 'center' }}>
                            {formData.id ? 'Update Ambassador' : 'Create Ambassador'}
                        </Button>
                        <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
