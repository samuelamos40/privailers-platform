"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AdminInstructorsPage() {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState("");

    // Form state for creating a new instructor directly
    const [creationForm, setCreationForm] = useState({ fullName: '', email: '', password: '' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch existing instructors
        const { data: instData } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'instructor')
            .order('created_at', { ascending: false });

        if (instData) setInstructors(instData);

        // Fetch students who could be promoted
        const { data: stuData } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student')
            .order('email', { ascending: true });

        if (stuData) setStudents(stuData);
        
        setLoading(false);
    };

    const handleCreateInstructor = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Get current session token for API verification
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session?.access_token) {
                alert("Authentication error: Your session may have expired. Please log out and log back in.");
                setIsCreating(false);
                return;
            }

            const response = await fetch('/api/admin/create-instructor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    full_name: creationForm.fullName,
                    email: creationForm.email,
                    password: creationForm.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Creation failed: ${data.error}`);
            } else {
                alert("Instructor Account Created Successfully! You can now send them their password.");
                setCreationForm({ fullName: '', email: '', password: '' });
                fetchData();
            }
        } catch (err: any) {
            alert(`Unexpected error: ${err.message}`);
        }
        setIsCreating(false);
    };

    const handlePromote = async () => {
        if (!selectedStudent) return;
        if (!confirm("Are you sure you want to promote this student to an Instructor?")) return;

        const { error } = await supabase
            .from('users')
            .update({ role: 'instructor' })
            .eq('id', selectedStudent);

        if (error) {
            alert(`Error promoting user: ${error.message}`);
        } else {
            alert("User successfully promoted to Instructor!");
            setSelectedStudent("");
            fetchData();
        }
    };

    const handleDemote = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to demote ${name} back to Student? They will lose access to the Instructor Portal.`)) return;

        const { error } = await supabase
            .from('users')
            .update({ role: 'student' })
            .eq('id', id);

        if (error) {
            alert(`Error demoting user: ${error.message}`);
        } else {
            alert("User successfully demoted back to Student.");
            fetchData();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>Manage Instructors</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <Card style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Direct Creation (Recommended)</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        Instantly create an instructor account without them needing to register first. Ensure you communicate the temporary password to them.
                    </p>
                    <form onSubmit={handleCreateInstructor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Full Name</label>
                            <input 
                                type="text" 
                                required 
                                value={creationForm.fullName}
                                onChange={(e) => setCreationForm({...creationForm, fullName: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={creationForm.email}
                                onChange={(e) => setCreationForm({...creationForm, email: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                                placeholder="instructor@example.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Temporary Password</label>
                            <input 
                                type="text" 
                                required 
                                minLength={6}
                                value={creationForm.password}
                                onChange={(e) => setCreationForm({...creationForm, password: e.target.value})}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                                placeholder="e.g. DataWelcome2026!"
                            />
                        </div>
                        <Button variant="primary" type="submit" disabled={isCreating} style={{ marginTop: '0.5rem' }}>
                            {isCreating ? 'Creating...' : 'Create Instructor Account'}
                        </Button>
                    </form>
                </Card>

                <Card>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Promote Existing Student</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        If the user has already registered as a student normally, you can select their account below to grant them Instructor privileges.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <select 
                            value={selectedStudent} 
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        >
                            <option value="">Select a student...</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.email} ({s.full_name})</option>
                            ))}
                        </select>
                        <Button variant="outline" onClick={handlePromote} disabled={!selectedStudent}>Promote to Instructor</Button>
                    </div>
                </Card>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table className="table-responsive">
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Instructor Name</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Joined Date</th>
                                <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instructors.map(inst => (
                                <tr key={inst.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{inst.full_name}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{inst.email}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {new Date(inst.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <Button variant="ghost" size="sm" onClick={() => handleDemote(inst.id, inst.full_name)}>Remove Access</Button>
                                    </td>
                                </tr>
                            ))}
                            {instructors.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No instructors found. Promote a student above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
