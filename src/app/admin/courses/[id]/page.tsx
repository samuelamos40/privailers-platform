"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";

export default function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const courseId = resolvedParams.id;

    // Course State
    const [course, setCourse] = useState<any>(null);
    const [isEditingCourse, setIsEditingCourse] = useState(false);

    // Module State
    const [modules, setModules] = useState<any[]>([]);

    // Project State
    const [projects, setProjects] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // Form State (Modules)
    const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileUploadType, setFileUploadType] = useState<string | null>(null); // 'video', 'guide', 'dataset'
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [moduleFormData, setModuleFormData] = useState({
        title: '',
        description: '', // Mapped to 'content' column
        videoUrl: ''
    });

    // Form State (Projects)
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [projectFormData, setProjectFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        datasetUrl: '',
        guideUrl: ''
    });

    // Grading State
    const [gradingProjectId, setGradingProjectId] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

    // --- UTILS ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'guide' | 'dataset') => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        setUploading(true);
        setFileUploadType(type);

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "privailers_public"); // Updated to new public preset
        // Use 'raw' for non-image/video files like ZIPs or PDFs, 'video' for videos
        data.append("resource_type", type === 'video' ? 'video' : 'raw');

        try {
            const endpoint = type === 'video'
                ? "https://api.cloudinary.com/v1_1/dnymde4mn/video/upload"
                : "https://api.cloudinary.com/v1_1/dnymde4mn/raw/upload"; // Force RAW endpoint

            const res = await fetch(endpoint, {
                method: "POST",
                body: data
            });
            const json = await res.json();

            if (json.secure_url) {
                if (type === 'video') {
                    setModuleFormData(prev => ({ ...prev, videoUrl: json.secure_url }));
                } else if (type === 'guide') {
                    setProjectFormData(prev => ({ ...prev, guideUrl: json.secure_url }));
                } else if (type === 'dataset') {
                    setProjectFormData(prev => ({ ...prev, datasetUrl: json.secure_url }));
                }
                alert("Upload (Raw Mode) successful!");
            } else {
                throw new Error(json.error?.message || "Upload failed");
            }
        } catch (error: any) {
            alert("Error uploading: " + error.message);
        } finally {
            setUploading(false);
            setFileUploadType(null);
        }
    };

    const getVideoEmbedUrl = (url: string) => {
        if (!url) return null;
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
                return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&showinfo=0`;
            }
            if (url.includes('vimeo.com')) {
                const videoId = url.split('/').pop()?.split('?')[0];
                return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&badge=0`;
            }
        } catch (e) {
            return null;
        }
        return url;
    };

    // --- DATA FETCHING ---

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        // Fetch Course
        const { data: courseData } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        setCourse(courseData);

        // Fetch Modules
        const { data: moduleData } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });

        setModules(moduleData || []);

        // Fetch Projects
        const { data: projectData } = await supabase
            .from('projects')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: true });

        setProjects(projectData || []);

        setLoading(false);
    };

    // --- COURSE ACTIONS ---

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase
            .from('courses')
            .update({
                title: course.title,
                description: course.description,
                duration: course.duration,
                price: course.price,
                tier: course.tier
            })
            .eq('id', courseId);

        if (!error) {
            alert('Course updated!');
            setIsEditingCourse(false);
        } else {
            alert('Error updating course: ' + error.message);
        }
    };

    const handleDeleteCourse = async () => {
        if (!confirm('DANGER: This will delete the ENTIRE COURSE and all its modules. Are you sure?')) return;

        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', courseId);

        if (!error) {
            router.push('/admin/courses');
        } else {
            alert('Error deleting course: ' + error.message);
        }
    };

    // --- MODULE ACTIONS ---

    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === modules.length - 1) return;

        const otherIndex = direction === 'up' ? index - 1 : index + 1;
        const currentModule = modules[index];
        const otherModule = modules[otherIndex];

        // Optimistic UI Update
        const newModules = [...modules];
        newModules[index] = otherModule;
        newModules[otherIndex] = currentModule;

        const tempOrder = newModules[index].order;
        newModules[index].order = newModules[otherIndex].order;
        newModules[otherIndex].order = tempOrder;

        setModules(newModules);

        await supabase.from('modules').update({ order: otherModule.order }).eq('id', currentModule.id);
        await supabase.from('modules').update({ order: currentModule.order }).eq('id', otherModule.id);

        fetchData();
    };

    const openAddModule = () => {
        setEditingModuleId(null);
        setModuleFormData({ title: '', description: '', videoUrl: '' });
        setIsModuleFormOpen(true);
        setIsProjectFormOpen(false); // Close other form
    };

    const startEditModule = (mod: any) => {
        setEditingModuleId(mod.id);
        setModuleFormData({
            title: mod.title,
            description: mod.content,
            videoUrl: mod.video_url || ''
        });
        setIsModuleFormOpen(true);
        setIsProjectFormOpen(false);
    };

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingModuleId) {
            // Update
            const { error } = await supabase
                .from('modules')
                .update({
                    title: moduleFormData.title,
                    content: moduleFormData.description,
                    video_url: moduleFormData.videoUrl
                })
                .eq('id', editingModuleId);

            if (!error) {
                alert('Module updated!');
                setIsModuleFormOpen(false);
                fetchData();
            } else {
                alert('Error updating module: ' + error.message);
            }
        } else {
            // Create
            const nextOrder = modules.length > 0 ? modules[modules.length - 1].order + 1 : 1;
            const { error } = await supabase
                .from('modules')
                .insert([{
                    course_id: courseId,
                    title: moduleFormData.title,
                    content: moduleFormData.description,
                    video_url: moduleFormData.videoUrl,
                    order: nextOrder
                }]);

            if (!error) {
                alert('Module added!');
                setIsModuleFormOpen(false);
                fetchData();
            } else {
                alert('Error adding module: ' + error.message);
            }
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Are you sure you want to delete this module?')) return;
        const { error } = await supabase.from('modules').delete().eq('id', moduleId);
        if (!error) fetchData();
        else alert('Error deleting module: ' + error.message);
    };

    // --- PROJECT ACTIONS ---

    const openAddProject = () => {
        setEditingProjectId(null);
        setProjectFormData({ title: '', description: '', due_date: '', datasetUrl: '', guideUrl: '' });
        setIsProjectFormOpen(true);
        setIsModuleFormOpen(false);
        setGradingProjectId(null); // Close grading
    };

    const startEditProject = (proj: any) => {
        setEditingProjectId(proj.id);
        let formattedDate = '';
        if (proj.due_date) {
            formattedDate = new Date(proj.due_date).toISOString().slice(0, 16);
        }

        setProjectFormData({
            title: proj.title,
            description: proj.description || '',
            due_date: formattedDate,
            datasetUrl: proj.dataset_url || '',
            guideUrl: proj.guide_url || ''
        });
        setIsProjectFormOpen(true);
        setIsModuleFormOpen(false);
        setGradingProjectId(null);
    };

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault();

        if (projectFormData.guideUrl) {
            try {
                new URL(projectFormData.guideUrl);
            } catch (_) {
                alert("Please enter a valid URL for the Assignment Guide (must include http:// or https://).");
                return;
            }
        }
        
        if (projectFormData.datasetUrl) {
            try {
                new URL(projectFormData.datasetUrl);
            } catch (_) {
                alert("Please enter a valid URL for the Dataset (must include http:// or https://).");
                return;
            }
        }

        const payload = {
            course_id: courseId,
            title: projectFormData.title,
            description: projectFormData.description,
            due_date: projectFormData.due_date ? new Date(projectFormData.due_date).toISOString() : null,
            dataset_url: projectFormData.datasetUrl,
            guide_url: projectFormData.guideUrl
        };

        if (editingProjectId) {
            const { error } = await supabase
                .from('projects')
                .update(payload)
                .eq('id', editingProjectId);

            if (!error) {
                alert('Project updated!');
                setIsProjectFormOpen(false);
                fetchData();
            } else {
                alert('Error updating project: ' + error.message);
            }
        } else {
            const { error } = await supabase
                .from('projects')
                .insert([payload]);

            if (!error) {
                alert('Project added!');
                setIsProjectFormOpen(false);
                fetchData();
            } else {
                alert('Error adding project: ' + error.message);
            }
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (!error) fetchData();
        else alert('Error deleting project: ' + error.message);
    };

    // --- GRADING ACTIONS ---

    const openGrading = async (projectId: string) => {
        setGradingProjectId(projectId);
        setIsLoadingSubmissions(true);
        setIsProjectFormOpen(false);
        setIsModuleFormOpen(false);

        // Fetch submissions
        const { data, error } = await supabase
            .from('project_submissions')
            .select(`
                *,
                user:users(email)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            alert("Error fetching submissions: " + error.message);
        } else {
            setSubmissions(data || []);
        }
        setIsLoadingSubmissions(false);
    };

    const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
        const { error } = await supabase
            .from('project_submissions')
            .update({
                grade: grade,
                feedback: feedback,
                status: 'graded'
            })
            .eq('id', submissionId);

        if (error) {
            alert("Error grading: " + error.message);
        } else {
            // Update local state
            setSubmissions(prev => prev.map(sub =>
                sub.id === submissionId ? { ...sub, grade, feedback, status: 'graded' } : sub
            ));
            alert("Grade saved!");
        }
    };

    if (loading) return <div>Loading editor...</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin/courses" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    ← Back to Courses
                </Link>

                {/* Course Title Header / Editor */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        {!isEditingCourse ? (
                            <>
                                <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                                    {course?.title}
                                </h1>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditingCourse(true)}>✎ Edit Title</Button>
                            </>
                        ) : (
                            <form onSubmit={handleUpdateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Edit Course Details</h3>
                                <Input label="Course Title" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} />
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Description</label>
                                    <RichTextEditor
                                        value={course.description}
                                        onChange={(val) => setCourse({ ...course, description: val })}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <Input label="Duration" value={course.duration} onChange={(e) => setCourse({ ...course, duration: e.target.value })} />
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Tier</label>
                                        <select
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white' }}
                                            value={course.tier}
                                            onChange={(e) => setCourse({ ...course, tier: e.target.value })}
                                        >
                                            <option value="free">Free</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </div>
                                {course.tier === 'paid' && (
                                    <Input label="Price (₦)" type="number" value={course.price || ''} onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })} />
                                )}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Button type="submit" variant="primary">Save Changes</Button>
                                    <Button type="button" variant="outline" onClick={() => setIsEditingCourse(false)}>Cancel</Button>
                                </div>
                            </form>
                        )}
                    </div>
                    <Button onClick={handleDeleteCourse} style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fee2e2' }} size="sm">
                        Delete Course
                    </Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '2rem' }}>
                {/* LEFT: Content List (Modules & Projects) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* MODULES SECTION */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Modules ({modules.length})</h2>
                            <Button variant="primary" onClick={openAddModule}>+ Add Module</Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {modules.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No modules yet.</p>}
                            {modules.map((mod, index) => (
                                <Card key={mod.id} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.25rem' }}>
                                        <button onClick={() => handleReorder(index, 'up')} disabled={index === 0} style={{ border: 'none', background: 'none', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}>▲</button>
                                        <button onClick={() => handleReorder(index, 'down')} disabled={index === modules.length - 1} style={{ border: 'none', background: 'none', cursor: index === modules.length - 1 ? 'default' : 'pointer', opacity: index === modules.length - 1 ? 0.3 : 1 }}>▼</button>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Module {index + 1}</div>
                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{mod.title}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button variant="outline" size="sm" onClick={() => startEditModule(mod)}>Edit</Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDeleteModule(mod.id)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>Delete</Button>
                                            </div>
                                        </div>
                                        {mod.video_url && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span>▶ Video Attached</span></div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* PROJECTS SECTION */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Class Projects ({projects.length})</h2>
                            <Button variant="outline" onClick={openAddProject}>+ Add Project</Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {projects.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No projects assigned yet.</p>}
                            {projects.map((proj, index) => (
                                <Card key={proj.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Assignment</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{proj.title}</div>
                                            {proj.due_date && (
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                    Due: {new Date(proj.due_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button variant="outline" size="sm" onClick={() => openGrading(proj.id)}>🔎 Submissions</Button>
                                            <Button variant="outline" size="sm" onClick={() => startEditProject(proj)}>Edit</Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDeleteProject(proj.id)} style={{ borderColor: '#ef4444', color: '#ef4444' }}>Delete</Button>
                                        </div>
                                    </div>
                                    {(proj.dataset_url || proj.guide_url) && (
                                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                                            {proj.guide_url && <a href={proj.guide_url} target="_blank" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>📄 View Guide</a>}
                                            {proj.dataset_url && <a href={proj.dataset_url} target="_blank" style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>📊 Download Dataset</a>}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>

                </div>

                {/* RIGHT: Add/Edit Forms OR Grading UI */}
                <div>
                    {/* MODULE FORM */}
                    {isModuleFormOpen && (
                        <Card style={{ position: 'sticky', top: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                {editingModuleId ? 'Edit Module' : 'New Module'}
                            </h3>
                            <form onSubmit={handleSaveModule}>
                                <Input label="Module Title" placeholder="e.g. Introduction to Excel" value={moduleFormData.title} onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })} required />
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Content</label>
                                    <RichTextEditor
                                        placeholder="Enter lesson text..."
                                        value={moduleFormData.description}
                                        onChange={(val) => setModuleFormData({ ...moduleFormData, description: val })}
                                    />
                                </div>
                                <Input label="Video URL" placeholder="Enter URL or Upload" value={moduleFormData.videoUrl} onChange={(e) => setModuleFormData({ ...moduleFormData, videoUrl: e.target.value })} />
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ backgroundColor: (uploading && fileUploadType === 'video') ? '#e2e8f0' : '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: uploading ? 'wait' : 'pointer', fontSize: '0.875rem', color: '#334155', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                        <span>{(uploading && fileUploadType === 'video') ? '⏳ Uploading...' : '⬆ Upload Video'}</span>
                                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} style={{ display: 'none' }} />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <Button type="submit" variant="primary" style={{ flex: 1, justifyContent: 'center' }}>{editingModuleId ? 'Update' : 'Save'}</Button>
                                    <Button type="button" variant="outline" onClick={() => setIsModuleFormOpen(false)}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* PROJECT FORM */}
                    {isProjectFormOpen && (
                        <Card style={{ position: 'sticky', top: '2rem', borderLeft: '4px solid #3b82f6' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e293b' }}>
                                {editingProjectId ? 'Edit Project' : 'New Project'}
                            </h3>
                            <form onSubmit={handleSaveProject}>
                                <Input label="Project Title" placeholder="e.g. Final Capstone" value={projectFormData.title} onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })} required />
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Description</label>
                                    <RichTextEditor
                                        placeholder="Describe the assignment..."
                                        value={projectFormData.description}
                                        onChange={(val) => setProjectFormData({ ...projectFormData, description: val })}
                                    />
                                </div>
                                <Input
                                    label="Due Date (Optional)"
                                    type="datetime-local"
                                    value={projectFormData.due_date}
                                    onChange={(e) => setProjectFormData({ ...projectFormData, due_date: e.target.value })}
                                />

                                <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Resources</h4>

                                {/* Guide Upload */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Assignment Guide (PDF/Doc)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Input value={projectFormData.guideUrl} placeholder="URL or Upload" onChange={(e) => setProjectFormData({ ...projectFormData, guideUrl: e.target.value })} style={{ flex: 1 }} />
                                        <label style={{ backgroundColor: (uploading && fileUploadType === 'guide') ? '#e2e8f0' : '#f1f5f9', padding: '0.5rem', borderRadius: '0.375rem', cursor: uploading ? 'wait' : 'pointer', border: '1px solid #cbd5e1' }}>
                                            <span>⬆</span>
                                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'guide')} disabled={uploading} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                </div>

                                {/* Dataset Upload */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>Dataset (CSV/Excel/Zip)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Input value={projectFormData.datasetUrl} placeholder="URL or Upload" onChange={(e) => setProjectFormData({ ...projectFormData, datasetUrl: e.target.value })} style={{ flex: 1 }} />
                                        <label style={{ backgroundColor: (uploading && fileUploadType === 'dataset') ? '#e2e8f0' : '#f1f5f9', padding: '0.5rem', borderRadius: '0.375rem', cursor: uploading ? 'wait' : 'pointer', border: '1px solid #cbd5e1' }}>
                                            <span>⬆</span>
                                            <input type="file" accept=".csv,.xlsx,.zip,.json" onChange={(e) => handleFileUpload(e, 'dataset')} disabled={uploading} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <Button type="submit" variant="primary" style={{ flex: 1, justifyContent: 'center' }}>{editingProjectId ? 'Update Project' : 'Save Project'}</Button>
                                    <Button type="button" variant="outline" onClick={() => setIsProjectFormOpen(false)}>Cancel</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* GRADING UI */}
                    {gradingProjectId && (
                        <Card style={{ position: 'sticky', top: '2rem', maxHeight: '80vh', overflowY: 'auto', borderLeft: '4px solid #8b5cf6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
                                    Submissions
                                </h3>
                                <button onClick={() => setGradingProjectId(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
                            </div>

                            {isLoadingSubmissions ? (
                                <p>Loading submissions...</p>
                            ) : submissions.length === 0 ? (
                                <p style={{ color: '#64748b' }}>No submissions yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {submissions.map(sub => (
                                        <div key={sub.id} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: 600, color: '#334155' }}>{sub.user?.email || 'Unknown User'}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(sub.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1rem', color: '#475569', whiteSpace: 'pre-wrap' }}>
                                                {sub.submission_content?.startsWith('http') ? (
                                                    <a href={sub.submission_content} target="_blank" style={{ color: '#2563eb', textDecoration: 'underline' }}>View Submission Link ↗</a>
                                                ) : sub.submission_content}
                                            </div>

                                            {/* Grading Inputs */}
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <div style={{ width: '80px' }}>
                                                    <Input
                                                        type="number"
                                                        placeholder="Grade"
                                                        value={sub.grade || ''}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, grade: val } : s));
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <Input
                                                        placeholder="Feedback..."
                                                        value={sub.feedback || ''}
                                                        onChange={(e) => {
                                                            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, feedback: e.target.value } : s));
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    onClick={() => handleGradeSubmission(sub.id, sub.grade, sub.feedback)}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                            {sub.status === 'graded' && <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>✓ Graded</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}

                    {!isModuleFormOpen && !isProjectFormOpen && !gradingProjectId && (
                        <Card style={{ backgroundColor: '#f8fafc', borderStyle: 'dashed', textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Select an item to add or edit.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
