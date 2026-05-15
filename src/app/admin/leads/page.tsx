"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/lib/supabase';
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";

export default function LeadCRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setLeads(data);
        }
        setLoading(false);
    };

    const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
        const { error } = await supabase
            .from('leads')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', leadId);

        if (!error) {
            fetchLeads(); // Refresh the list
        }
    };

    const handleViewLead = (lead: Lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const exportToCSV = () => {
        if (leads.length === 0) return;

        const headers = ['Name', 'Email', 'Company', 'Interest', 'Status', 'Message', 'Created At'];
        const csvRows = [
            headers.join(','),
            ...leads.map(lead => [
                `"${lead.name.replace(/"/g, '""')}"`,
                `"${lead.email.replace(/"/g, '""')}"`,
                `"${(lead.company || '').replace(/"/g, '""')}"`,
                `"${lead.interest.replace(/"/g, '""')}"`,
                `"${lead.status.replace(/"/g, '""')}"`,
                `"${lead.message.replace(/"/g, '""')}"`,
                `"${new Date(lead.created_at).toLocaleString()}"`
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return { bg: '#dbeafe', text: '#1e40af' };
            case 'contacted': return { bg: '#fef3c7', text: '#d97706' };
            case 'qualified': return { bg: '#e0e7ff', text: '#4f46e5' };
            case 'closed': return { bg: '#dcfce7', text: '#15803d' };
            default: return { bg: '#f3f4f6', text: '#6b7280' };
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Lead Management</h1>
                <Button variant="primary" onClick={exportToCSV}>Export CSV</Button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table-responsive">
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Interest</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => {
                                const statusColors = getStatusColor(lead.status);
                                return (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{lead.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--foreground)' }}>{lead.email}</div>
                                            {lead.company && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.company}</div>}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{lead.interest}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={lead.status}
                                                onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: statusColors.bg,
                                                    color: statusColors.text,
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <Button variant="ghost" size="sm" onClick={() => handleViewLead(lead)}>View</Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {leads.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No leads yet. Check back later!
                    </div>
                )}
            </Card>

            {/* Lead Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Lead Details"
            >
                {selectedLead && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Full Name</label>
                                <p style={{ fontSize: '1rem', fontWeight: 500, margin: '0.25rem 0' }}>{selectedLead.name}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email Address</label>
                                <p style={{ fontSize: '1rem', margin: '0.25rem 0' }}>{selectedLead.email}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Company</label>
                                <p style={{ fontSize: '1rem', margin: '0.25rem 0' }}>{selectedLead.company || 'N/A'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Interest</label>
                                <p style={{ fontSize: '1rem', margin: '0.25rem 0' }}>{selectedLead.interest}</p>
                            </div>
                        </div>
                        
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Message</label>
                            <div style={{ 
                                backgroundColor: '#f8fafc', 
                                padding: '1rem', 
                                borderRadius: '0.5rem', 
                                border: '1px solid #e2e8f0',
                                marginTop: '0.5rem',
                                fontSize: '0.925rem',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {selectedLead.message}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Received on {new Date(selectedLead.created_at).toLocaleString()}
                            </span>
                            <div style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '1rem', 
                                fontSize: '0.75rem', 
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: getStatusColor(selectedLead.status).bg,
                                color: getStatusColor(selectedLead.status).text
                            }}>
                                {selectedLead.status}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
