"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminNewsletterPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setSubscribers(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this subscriber?')) return;
        
        const { error } = await supabase
            .from('newsletter_subscribers')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Failed to delete: ' + error.message);
        } else {
            setSubscribers(subscribers.filter(s => s.id !== id));
        }
    };

    const exportToCSV = () => {
        const headers = ['Email', 'Subscribed At'];
        const rows = subscribers.map(s => [s.email, new Date(s.created_at).toLocaleString()]);
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "newsletter_subscribers.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="main-content admin">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-blue)' }}>Newsletter Subscribers</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your audience and export your list.</p>
                </div>
                <Button variant="outline" onClick={exportToCSV} disabled={subscribers.length === 0}>
                    📥 Export to CSV
                </Button>
            </div>

            {error && (
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            <Card padding="none">
                <div className="table-container">
                    <table className="table-responsive">
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Email Address</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Date Joined</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subscribers...</td></tr>
                            ) : subscribers.length === 0 ? (
                                <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subscribers found.</td></tr>
                            ) : (
                                subscribers.map((sub) => (
                                    <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{sub.email}</td>
                                        <td style={{ padding: '1rem', color: '#64748b' }}>
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleDelete(sub.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
