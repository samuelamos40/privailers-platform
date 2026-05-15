"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<any>({
        id: '',
        full_name: '',
        email: '',
        access_status: 'active',
        access_expires_at: ''
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                enrollments(
                    id, 
                    status, 
                    cohort:cohorts(name)
                )
            `)
            .eq('role', 'student')
            .order('created_at', { ascending: false });

        if (!error) setStudents(data || []);
        setLoading(false);
    };

    const handleUpdateAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            access_status: selectedUser.access_status,
            access_expires_at: selectedUser.access_expires_at ? new Date(selectedUser.access_expires_at).toISOString() : null
        };

        const { error } = await supabase.from('users').update(payload).eq('id', selectedUser.id);
        
        if (error) alert("Error updating user: " + error.message);
        else {
            alert("User access updated!");
            setIsEditOpen(false);
            fetchStudents();
        }
    };

    const filteredStudents = students.filter(s => 
        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Student Management</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Input 
                        placeholder="Search students..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '300px', marginBottom: 0 }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isEditOpen ? '1fr 400px' : '1fr', gap: '2rem' }}>
                <Card padding="none">
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Student Details</th>
                                <th style={{ padding: '1rem' }}>Tier / Access</th>
                                <th style={{ padding: '1rem' }}>Current Cohorts</th>
                                <th style={{ padding: '1rem' }}>Joined On</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(s => {
                                const hasPaidEnrollment = s.enrollments?.length > 0;
                                const activeCohorts = s.enrollments?.filter((e: any) => e.cohort).map((e: any) => e.cohort.name).join(', ');
                                
                                return (
                                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{s.full_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                                <span style={{ 
                                                    fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px',
                                                    backgroundColor: hasPaidEnrollment ? '#ebf5ff' : '#f1f5f9',
                                                    color: hasPaidEnrollment ? '#2563eb' : '#64748b'
                                                }}>
                                                    {hasPaidEnrollment ? 'PREMIUM' : 'FREE / TRIAL'}
                                                </span>
                                            </div>
                                            <span style={{ 
                                                fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '1rem',
                                                backgroundColor: s.access_status === 'active' ? '#dcfce7' : '#fee2e2',
                                                color: s.access_status === 'active' ? '#166534' : '#991b1b'
                                            }}>
                                                {s.access_status?.toUpperCase() || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569' }}>
                                            {activeCohorts || <span style={{ color: '#cbd5e1' }}>None</span>}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                            {new Date(s.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <Button size="sm" variant="outline" onClick={() => {
                                                setSelectedUser({
                                                    id: s.id,
                                                    full_name: s.full_name,
                                                    email: s.email,
                                                    access_status: s.access_status || 'active',
                                                    access_expires_at: s.access_expires_at ? new Date(s.access_expires_at).toISOString().slice(0, 10) : ''
                                                });
                                                setIsEditOpen(true);
                                            }}>Security / Expiry</Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Card>

                {isEditOpen && (
                    <Card style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Manage Access</h3>
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                            <div style={{ fontWeight: 600 }}>{selectedUser.full_name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedUser.email}</div>
                        </div>

                        <form onSubmit={handleUpdateAccess} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Account Status</label>
                                <select 
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                    value={selectedUser.access_status}
                                    onChange={e => setSelectedUser({...selectedUser, access_status: e.target.value})}
                                >
                                    <option value="active">Active</option>
                                    <option value="deactivated">Deactivated / Locked</option>
                                </select>
                            </div>

                            <Input 
                                label="Expiry Date (for Free Users)" 
                                type="date" 
                                value={selectedUser.access_expires_at} 
                                onChange={e => setSelectedUser({...selectedUser, access_expires_at: e.target.value})} 
                                placeholder="Set expiry date"
                            />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <Button variant="primary" type="submit" style={{ flex: 1, justifyContent: 'center' }}>Update User</Button>
                                <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}
