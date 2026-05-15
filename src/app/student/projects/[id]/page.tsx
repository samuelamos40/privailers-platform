"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const resolvedParams = use(params);
    const projectId = resolvedParams.id;

    const [project, setProject] = useState<any>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [submissionType, setSubmissionType] = useState<'text' | 'file'>('text');
    const [content, setContent] = useState('');
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) fetchData();
    }, [projectId, user]);

    const fetchData = async () => {
        setLoading(true);
        const { data: projectData } = await supabase
            .from('projects')
            .select(`*, course:courses(title, id)`)
            .eq('id', projectId)
            .single();

        setProject(projectData);

        const { data: submissionData } = await supabase
            .from('project_submissions')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user!.id)
            .single();

        if (submissionData) {
            setSubmission(submissionData);
            // Detect if content is a URL (simple check)
            const isUrl = submissionData.submission_content?.startsWith('http');
            if (isUrl) {
                setSubmissionType('file');
                setUploadedFileUrl(submissionData.submission_content);
            } else {
                setSubmissionType('text');
                setContent(submissionData.submission_content || '');
            }
        }
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        setUploading(true);

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "privailers_public");
        data.append("resource_type", "auto"); // 'auto' detects pdf, zip, etc.

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dnymde4mn/auto/upload", {
                method: "POST",
                body: data
            });
            const json = await res.json();

            if (json.secure_url) {
                setUploadedFileUrl(json.secure_url);
                alert("File uploaded successfully! Don't forget to click 'Submit Assignment' to save it.");
            } else {
                throw new Error(json.error?.message || "Upload failed");
            }
        } catch (error: any) {
            alert("Error uploading: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const finalContent = submissionType === 'file' ? uploadedFileUrl : content;

        if (!finalContent) {
            alert("Please provide content or upload a file.");
            setSubmitting(false);
            return;
        }

        const payload = {
            project_id: projectId,
            user_id: user!.id,
            submission_content: finalContent,
            status: 'submitted'
        };

        let error;

        if (submission) {
            const { error: updateError } = await supabase
                .from('project_submissions')
                .update(payload)
                .eq('id', submission.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('project_submissions')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            alert('Error submitting: ' + error.message);
        } else {
            alert('Assignment submitted successfully!');
            fetchData();
        }
        setSubmitting(false);
    };

    // Helper to force download on Cloudinary URLs
    // Helper to force download on Cloudinary URLs
    const getDownloadUrl = (url: string) => {
        return url;
    };

    if (loading) return <div style={{ padding: '3rem' }}>Loading project...</div>;
    if (!project) return <div style={{ padding: '3rem' }}>Project not found.</div>;

    const isGraded = submission?.status === 'graded';
    const hasSubmitted = !!submission;

    return (
        <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
            <Link href={`/student/courses/${project.course.id}`} style={{ color: '#64748b', marginBottom: '1rem', display: 'inline-block', textDecoration: 'none' }}>
                ← Back to {project.course.title}
            </Link>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                    {project.title}
                </h1>
                <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                    <span>Course: {project.course.title}</span>
                    {project.due_date && <span style={{ color: '#ef4444' }}>Due: {new Date(project.due_date).toLocaleDateString()}</span>}
                </div>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Description & Resources */}
                <Card>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Instructions</h3>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#334155', marginBottom: '1.5rem' }}>
                        {project.description}
                    </div>

                    {(project.guide_url || project.dataset_url) && (
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>
                                Resources
                            </h4>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {project.guide_url && (
                                    <a href={project.guide_url} target="_blank" rel="noopener noreferrer" style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1rem', backgroundColor: '#eff6ff', color: '#2563eb',
                                        borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 500
                                    }}>
                                        📄 Download Guide
                                    </a>
                                )}
                                {project.dataset_url && (
                                    <a href={project.dataset_url} target="_blank" rel="noopener noreferrer" style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', color: '#059669',
                                        borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 500
                                    }}>
                                        📊 Download Dataset
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Grading Result */}
                {
                    isGraded && (
                        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '1rem', padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'items-center', marginBottom: '1rem' }}>
                                <h3 style={{ color: '#166534', fontSize: '1.25rem', margin: 0 }}>Graded Assignment</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>
                                    {submission.grade} <span style={{ fontSize: '1rem', color: '#86efac' }}>/ 100</span>
                                </div>
                            </div>
                            {submission.feedback && (
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#15803d', marginBottom: '0.5rem' }}>Instructor Feedback</h4>
                                    <p style={{ color: '#14532d' }}>{submission.feedback}</p>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* Submission Form */}
                <Card style={{ borderLeft: isGraded ? '4px solid #22c55e' : '4px solid #3b82f6' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                        {hasSubmitted ? (isGraded ? 'Your Submission' : 'Update Submission') : 'Submit Assignment'}
                    </h3>

                    {isGraded ? (
                        <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: '#475569' }}>
                            {submission.submission_content.startsWith('http') ? (
                                <a href={submission.submission_content} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                                    View Submitted File/Link
                                </a>
                            ) : submission.submission_content}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Toggle Submission Type */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setSubmissionType('text')}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid',
                                        borderColor: submissionType === 'text' ? '#3b82f6' : '#e2e8f0',
                                        backgroundColor: submissionType === 'text' ? '#eff6ff' : 'white',
                                        color: submissionType === 'text' ? '#1d4ed8' : '#64748b',
                                        fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Text / Link
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSubmissionType('file')}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid',
                                        borderColor: submissionType === 'file' ? '#3b82f6' : '#e2e8f0',
                                        backgroundColor: submissionType === 'file' ? '#eff6ff' : 'white',
                                        color: submissionType === 'file' ? '#1d4ed8' : '#64748b',
                                        fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    File Upload
                                </button>
                            </div>

                            {submissionType === 'text' ? (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            minHeight: '150px',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #cbd5e1',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder="Paste your link or write your answer here..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required={submissionType === 'text'}
                                    />
                                </div>
                            ) : (
                                <div style={{ marginBottom: '1.5rem', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '0.75rem', padding: '2rem' }}>
                                    {uploadedFileUrl ? (
                                        <div style={{ color: '#059669', fontWeight: 600, marginBottom: '1rem' }}>
                                            ✅ File Uploaded!
                                            <div style={{ fontSize: '0.8rem', fontWeight: 400, marginTop: '0.25rem', color: '#64748b' }}>
                                                {uploadedFileUrl.split('/').pop()}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#64748b', marginBottom: '1rem' }}>
                                            {uploading ? 'Uploading...' : 'Upload your Project File (PDF, Zip, Doc)'}
                                        </div>
                                    )}

                                    <label style={{
                                        display: 'inline-block',
                                        backgroundColor: uploading ? '#e2e8f0' : '#3b82f6',
                                        color: uploading ? '#94a3b8' : 'white',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.5rem',
                                        cursor: uploading ? 'wait' : 'pointer',
                                        fontWeight: 600
                                    }}>
                                        {uploading ? 'Please Wait...' : (uploadedFileUrl ? 'Replace File' : 'Choose File')}
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            )}

                            <Button type="submit" variant="primary" size="lg" disabled={submitting || (submissionType === 'file' && !uploadedFileUrl) || uploading}>
                                {submitting ? 'Submitting...' : (hasSubmitted ? 'Update Submission' : 'Submit Assignment')}
                            </Button>
                        </form>
                    )}
                </Card>
            </div >
        </div >
    );
}
