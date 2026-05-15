"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function AdminAssignmentsPage() {
    // Data State
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter/Tab State
    const [activeTab, setActiveTab] = useState<'inbox' | 'all' | 'gradebook'>('inbox');

    // Grading State
    const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
    const [gradeInput, setGradeInput] = useState<number>(0);
    const [feedbackInput, setFeedbackInput] = useState<string>('');
    const [isSavingGrade, setIsSavingGrade] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('project_submissions')
            .select(`
                *,
                user:users(email, full_name),
                project:projects(title, course:courses(title))
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching submissions:", JSON.stringify(error, null, 2));
            alert("Error fetching submissions: " + error.message);
        } else {
            setSubmissions(data || []);
        }
        setLoading(false);
    };

    // --- GRADING ACTIONS ---

    const openGradingModal = (sub: any) => {
        setGradingSubmission(sub);
        setGradeInput(sub.grade || 0);
        setFeedbackInput(sub.feedback || '');
    };

    const closeGradingModal = () => {
        setGradingSubmission(null);
        setGradeInput(0);
        setFeedbackInput('');
    };

    const handleSaveGrade = async () => {
        if (!gradingSubmission) return;
        setIsSavingGrade(true);

        const { error } = await supabase
            .from('project_submissions')
            .update({
                grade: gradeInput,
                feedback: feedbackInput,
                status: 'graded'
            })
            .eq('id', gradingSubmission.id);

        if (error) {
            alert("Error saving grade: " + error.message);
        } else {
            // Send Email Notification
            try {
                if (gradingSubmission.user?.email) {
                    const response = await fetch('/api/email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: gradingSubmission.user.email,
                            subject: `Your assignment for ${gradingSubmission.project?.title} has been graded!`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                    <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">Assignment Graded</h1>
                                    <p style="color: #334155; font-size: 16px;">Hello ${gradingSubmission.user?.full_name || 'Student'},</p>
                                    <p style="color: #334155; font-size: 16px;">Your submission for <strong>${gradingSubmission.project?.title}</strong> in the course <strong>${gradingSubmission.project?.course?.title}</strong> has been graded.</p>
                                    
                                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #38bdf8;">
                                        <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 20px;">Score: <span style="color: #059669;">${gradeInput}/100</span></h2>
                                        <h3 style="margin: 0 0 5px 0; color: #475569; font-size: 14px; text-transform: uppercase;">Instructor Feedback:</h3>
                                        <p style="margin: 0; color: #1e293b; white-space: pre-wrap;">${feedbackInput || 'No specific feedback provided.'}</p>
                                    </div>
                                    
                                    <p style="color: #334155; font-size: 16px;">Log in to your dashboard to review your progress. Keep up the great work!</p>
                                    
                                    <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                                        This is an automated message from Privailers Academy.
                                    </p>
                                </div>
                            `
                        })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.warn("Email notification skipped/failed:", errorText);
                    }
                }
            } catch (err) {
                console.error("Email API network error:", err);
            }

            // Update local state
            setSubmissions(prev => prev.map(s =>
                s.id === gradingSubmission.id
                    ? { ...s, grade: gradeInput, feedback: feedbackInput, status: 'graded' }
                    : s
            ));
            closeGradingModal();
        }
        setIsSavingGrade(false);
    };

    // --- VIEWS ---

    const renderInbox = () => {
        // Filter for 'submitted' status (not 'graded')
        const inboxItems = submissions.filter(s => s.status === 'submitted');

        if (inboxItems.length === 0) {
            return (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                    <p style={{ fontSize: '1.25rem' }}>🎉 All caught up!</p>
                    <p style={{ fontSize: '0.9rem' }}>No pending submissions to grade.</p>
                </div>
            );
        }

        return (
            <div style={{ display: 'grid', gap: '1rem' }}>
                {inboxItems.map(sub => (
                    <Card key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                {sub.project?.course?.title} • {sub.project?.title}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                {sub.user?.email || 'Unknown User'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                Submitted: {new Date(sub.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <Button onClick={() => openGradingModal(sub)}>Grade Submission</Button>
                    </Card>
                ))}
            </div>
        );
    };

    const renderAllSubmissions = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {submissions.length === 0 && <p style={{ color: '#64748b' }}>No submissions found.</p>}
                {submissions.map(sub => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{sub.user?.email || 'Unknown User'}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{sub.project?.title}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                                padding: '0.25rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                backgroundColor: sub.status === 'graded' ? '#dcfce7' : '#fff7ed',
                                color: sub.status === 'graded' ? '#166534' : '#c2410c'
                            }}>
                                {sub.status === 'graded' ? `Graded: ${sub.grade}/100` : 'Pending'}
                            </span>
                            <Button size="sm" variant="outline" onClick={() => openGradingModal(sub)}>Edit</Button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderGradebook = () => {
        // Group by User
        const userGrades: Record<string, any> = {};

        submissions.forEach(sub => {
            const email = sub.user?.email;
            if (!email) return;

            if (!userGrades[email]) {
                userGrades[email] = {
                    user: email,
                    totalPoints: 0,
                    gradedCount: 0,
                    submissions: []
                };
            }

            userGrades[email].submissions.push(sub);
            if (sub.status === 'graded') {
                userGrades[email].totalPoints += (sub.grade || 0);
                userGrades[email].gradedCount += 1;
            }
        });

        const sortedUsers = Object.values(userGrades).sort((a, b) => b.totalPoints - a.totalPoints);

        if (sortedUsers.length === 0) {
            return (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    <p>No student data available yet.</p>
                </div>
            );
        }

        return (
            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: '#64748b' }}>Student</th>
                            <th style={{ padding: '1rem', color: '#64748b' }}>Completed</th>
                            <th style={{ padding: '1rem', color: '#64748b' }}>Avg. Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((u: any) => (
                            <tr key={u.user} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{u.user}</td>
                                <td style={{ padding: '1rem' }}>{u.gradedCount} Assignments</td>
                                <td style={{ padding: '1rem', color: '#059669', fontWeight: 700 }}>
                                    {u.gradedCount > 0 ? (u.totalPoints / u.gradedCount).toFixed(1) : '-'}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        );
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading Assignments...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#1e293b' }}>Assignments & Grading</h1>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                {[
                    { id: 'inbox', label: '📥 Inbox (Pending)' },
                    { id: 'all', label: '🗂 All Submissions' },
                    { id: 'gradebook', label: '📊 Gradebook' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            padding: '1rem', border: 'none', background: 'none', cursor: 'pointer',
                            borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                            color: activeTab === tab.id ? '#2563eb' : '#64748b',
                            fontWeight: activeTab === tab.id ? 600 : 500
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'inbox' && renderInbox()}
            {activeTab === 'all' && renderAllSubmissions()}
            {activeTab === 'gradebook' && renderGradebook()}

            {/* GRADING MODAL */}
            {gradingSubmission && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <Card style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Grade Submission</h3>
                            <button onClick={closeGradingModal} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                <strong>Student:</strong> {gradingSubmission.user?.email || 'Unknown User'} <br />
                                <strong>Project:</strong> {gradingSubmission.project?.title}
                            </div>
                            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Submission:</div>
                            {gradingSubmission.submission_content?.startsWith('http') ? (
                                <a href={gradingSubmission.submission_content} target="_blank" style={{ color: '#2563eb', textDecoration: 'underline', display: 'block', padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.25rem' }}>
                                    📄 Open Submitted File/Link ↗
                                </a>
                            ) : (
                                <p style={{ whiteSpace: 'pre-wrap', backgroundColor: 'white', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem' }}>
                                    {gradingSubmission.submission_content}
                                </p>
                            )}
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <Input
                                label="Grade (0-100)"
                                type="number"
                                value={gradeInput}
                                onChange={(e) => setGradeInput(e.target.value === '' ? 0 : Math.min(100, Math.max(0, parseInt(e.target.value))))}
                            />
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Feedback</label>
                                <textarea
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', minHeight: '100px', fontFamily: 'inherit' }}
                                    placeholder="Great work on this..."
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <Button variant="outline" onClick={closeGradingModal} style={{ flex: 1 }}>Cancel</Button>
                                <Button variant="primary" onClick={handleSaveGrade} disabled={isSavingGrade} style={{ flex: 2 }}>{isSavingGrade ? 'Saving...' : 'Save Grade'}</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
