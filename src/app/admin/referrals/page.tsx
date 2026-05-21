"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminReferralsPage() {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('referrals')
            .select(`
                *,
                ambassador:ambassadors(full_name, referral_code)
            `)
            .order('created_at', { ascending: false });

        if (!error) setReferrals(data || []);
        setLoading(false);
    };

    const markAsPaid = async (id: string) => {
        if (!confirm("Mark this commission as paid?")) return;
        const { error } = await supabase.from('referrals').update({ commission_paid: true }).eq('id', id);
        if (!error) fetchReferrals();
        else alert("Error: " + error.message);
    };

    const markAsUnpaid = async (id: string) => {
        const { error } = await supabase.from('referrals').update({ commission_paid: false }).eq('id', id);
        if (!error) fetchReferrals();
    };

    const filtered = referrals.filter(r => {
        if (filter === 'unpaid') return !r.commission_paid;
        if (filter === 'paid') return r.commission_paid;
        return true;
    });

    const totalCommissionOwed = referrals.filter(r => !r.commission_paid).reduce((sum, r) => sum + parseFloat(r.commission_amount || 0), 0);
    const totalPaidOut = referrals.filter(r => r.commission_paid).reduce((sum, r) => sum + parseFloat(r.commission_amount || 0), 0);
    const totalRevenue = referrals.reduce((sum, r) => sum + parseFloat(r.amount_paid || 0), 0);

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>Referral Tracking 💰</h1>
                <p style={{ color: '#64748b' }}>Track ambassador referrals and manage commission payouts</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <Card style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>{referrals.length}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Referrals</div>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>₦{totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Revenue from Referrals</div>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1.5rem', border: totalCommissionOwed > 0 ? '2px solid #f59e0b' : undefined }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>₦{totalCommissionOwed.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Commission Owed</div>
                </Card>
                <Card style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>₦{totalPaidOut.toLocaleString()}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Paid Out</div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['all', 'unpaid', 'paid'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '0.5rem 1.25rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                        backgroundColor: filter === f ? '#7c3aed' : '#f1f5f9',
                        color: filter === f ? 'white' : '#64748b'
                    }}>
                        {f === 'all' ? `All (${referrals.length})` : f === 'unpaid' ? `Unpaid (${referrals.filter(r => !r.commission_paid).length})` : `Paid (${referrals.filter(r => r.commission_paid).length})`}
                    </button>
                ))}
            </div>

            {/* Referrals Table */}
            {loading ? <p>Loading referrals...</p> : filtered.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    {referrals.length === 0 ? 'No referrals yet. They will appear here when students register using ambassador codes.' : 'No referrals match the selected filter.'}
                </Card>
            ) : (
                <Card style={{ overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Ambassador</th>
                                <th style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Student Email</th>
                                <th style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Amount Paid</th>
                                <th style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Commission</th>
                                <th style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '0.75rem', color: '#64748b', fontWeight: 600 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem', color: '#475569' }}>
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.ambassador?.full_name || 'Unknown'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700 }}>{r.ambassador?.referral_code}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem', color: '#475569' }}>{r.referred_email}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#059669' }}>
                                        ₦{parseFloat(r.amount_paid || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                                        ₦{parseFloat(r.commission_amount || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '1rem',
                                            backgroundColor: r.commission_paid ? '#dcfce7' : '#fef3c7',
                                            color: r.commission_paid ? '#166534' : '#92400e'
                                        }}>
                                            {r.commission_paid ? 'PAID' : 'UNPAID'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {r.commission_paid ? (
                                            <Button size="sm" variant="ghost" onClick={() => markAsUnpaid(r.id)} style={{ fontSize: '0.75rem' }}>
                                                Undo
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="primary" onClick={() => markAsPaid(r.id)} style={{ fontSize: '0.75rem' }}>
                                                Mark Paid
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
}
