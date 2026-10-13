"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function AdminGradingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const assignmentId = resolvedParams.id;

    const [assignment, setAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Grading State
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        // 1. Assignment
        const { data: assignData } = await supabase.from('assignments').select('*').eq('id', assignmentId).single();
        setAssignment(assignData);

        // 2. Submissions
        const { data: subData } = await supabase
            .from('submissions')
            .select('*')
            .eq('assignment_id', assignmentId)
            .order('submitted_at', { ascending: false });

        if (subData && subData.length > 0) {
            // 3. Fetch Profiles for these users manually (safe way)
            const userIds = Array.from(new Set(subData.map((s: any) => s.user_id)));
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .in('id', userIds);

            const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));

            // Merge
            const merged = subData.map((s: any) => ({
                ...s,
                profile: profileMap.get(s.user_id) || { full_name: 'Unknown Student', email: 'No Email' }
            }));
            setSubmissions(merged);
        } else {
            setSubmissions([]);
        }

        setLoading(false);
    };

    const handleSelectSubmission = (sub: any) => {
        setSelectedSubmission(sub);
        setGrade(sub.grade || '');
        setFeedback(sub.feedback || '');
    };

    const handleSaveGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        const { error } = await supabase
            .from('submissions')
            .update({
                grade: parseInt(grade),
                feedback: feedback,
                status: 'graded'
            })
            .eq('id', selectedSubmission.id);

        if (!error) {
            alert("Grade saved!");
            setSelectedSubmission(null);
            fetchData(); // Refresh list to show updated status
        } else {
            alert("Error: " + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!assignment) return <div>Assignment not found.</div>;

    return (
        <div className="portal-split-layout wide" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
            {/* LEFT: Submission List */}
            <div>
                <div style={{ marginBottom: '1rem' }}>
                    <Link href="/instructor/assignments" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Back to Assignments</Link>
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem', wordBreak: 'break-word' }}>{assignment.title}</h1>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>{submissions.length} Submissions</p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {submissions.length === 0 && <Card style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>No student has submitted yet.</Card>}
                    {submissions.map((sub) => (
                        <Card
                            key={sub.id}
                            style={{
                                cursor: 'pointer',
                                borderLeft: selectedSubmission?.id === sub.id ? '4px solid #0284c7' : '1px solid #e2e8f0',
                                backgroundColor: selectedSubmission?.id === sub.id ? '#f0f9ff' : 'white'
                            }}
                            onClick={() => handleSelectSubmission(sub)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div>
                                    <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{sub.profile.full_name || sub.profile.email}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    {sub.status === 'graded' ? (
                                        <span style={{ color: '#059669', fontWeight: 700 }}>{sub.grade}/100</span>
                                    ) : (
                                        <span style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: 600 }}>Pending</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* RIGHT: Grading Panel */}
            <div>
                <Card style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
                    {selectedSubmission ? (
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Grading</h2>

                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Submission File</div>
                                <a href={selectedSubmission.file_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm" style={{ width: '100%' }}>Download File</Button>
                                </a>
                            </div>

                            <form onSubmit={handleSaveGrade} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <Input
                                    label="Grade (0-100)"
                                    type="number"
                                    min="0" max="100"
                                    value={grade}
                                    onChange={e => setGrade(e.target.value)}
                                    required
                                />

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Feedback</label>
                                    <textarea
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', minHeight: '120px' }}
                                        value={feedback}
                                        onChange={e => setFeedback(e.target.value)}
                                        placeholder="Great job! Next time try to..."
                                    />
                                </div>

                                <Button type="submit" variant="primary" style={{ width: '100%' }}>Save Grade</Button>
                            </form>
                        </div>
                    ) : (
                        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 1rem' }}>
                            Select a submission on the left to grade it.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
