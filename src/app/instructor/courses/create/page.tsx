"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tier: 'free',
        duration: '',
        price: '0'
    });

    // Project State
    const [addProject, setAddProject] = useState(false);
    const [projectData, setProjectData] = useState({
        title: '',
        description: '',
        due_date: '',
        guide_url: '',
        dataset_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase
            .from('courses')
            .insert([{
                title: formData.title,
                description: formData.description,
                tier: formData.tier,
                duration: formData.duration?.trim() || 'Self-Paced',
                price: parseFloat(formData.price) || 0,
                instructor_id: session?.user?.id
            }])
            .select()
            .single();

        if (error) {
            alert('Error creating course: ' + error.message);
            setLoading(false);
            return;
        }

        // Create Project if instructor enabled it
        if (addProject && projectData.title.trim()) {
            const { error: projError } = await supabase
                .from('projects')
                .insert([{
                    course_id: data.id,
                    title: projectData.title.trim(),
                    description: projectData.description.trim() || 'Complete the course project according to instructions.',
                    due_date: projectData.due_date ? new Date(projectData.due_date).toISOString() : null,
                    guide_url: projectData.guide_url.trim() || null,
                    dataset_url: projectData.dataset_url.trim() || null
                }]);
            
            if (projError) {
                console.error("Project creation error:", projError);
                alert("Course created, but could not attach project: " + projError.message);
            }
        }

        // Redirect to the editor for this new course
        router.push(`/instructor/courses/${data.id}`);
    };

    return (
        <div style={{ maxWidth: '650px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/instructor/courses" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    ← Back to Courses
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: '#1e293b' }}>
                    Create New Course
                </h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Course Title"
                        placeholder="e.g. Advanced Excel Mastery"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>
                            Description
                        </label>
                        <textarea
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #cbd5e1',
                                minHeight: '100px',
                                fontFamily: 'inherit'
                            }}
                            placeholder="What will students learn?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>
                                Tier
                            </label>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1',
                                    fontFamily: 'inherit',
                                    backgroundColor: 'white'
                                }}
                                value={formData.tier}
                                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                            >
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                        <Input
                            label="Estimated Duration (Optional)"
                            placeholder="e.g. Self-Paced, 4 weeks, 10 hours"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                    </div>

                    {formData.tier === 'paid' && (
                        <Input
                            label="Price (NGN)"
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    )}

                    {/* PROJECT CREATION SECTION */}
                    <div style={{ 
                        marginTop: '1.5rem', 
                        marginBottom: '1.5rem', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '0.75rem', 
                        padding: '1.25rem',
                        backgroundColor: addProject ? '#f8fafc' : '#ffffff',
                        transition: 'background-color 0.2s'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}>
                                <input 
                                    type="checkbox" 
                                    checked={addProject} 
                                    onChange={(e) => setAddProject(e.target.checked)} 
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span>Add Course Project / Assignment Now</span>
                            </label>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Optional</span>
                        </div>

                        {addProject && (
                            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                                <Input 
                                    label="Project Title"
                                    placeholder="e.g. End-to-End Sales Dashboard Capstone"
                                    value={projectData.title}
                                    onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                                    required={addProject}
                                />

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>
                                        Project Instructions / Description
                                    </label>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid #cbd5e1',
                                            minHeight: '80px',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder="Detailed deliverables, expectations, and guidelines..."
                                        value={projectData.description}
                                        onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                                        required={addProject}
                                    />
                                </div>

                                <Input 
                                    label="Due Date (Optional)"
                                    type="date"
                                    value={projectData.due_date}
                                    onChange={(e) => setProjectData({ ...projectData, due_date: e.target.value })}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
                                    <Input 
                                        label="Guide / Brief URL (Optional)"
                                        type="url"
                                        placeholder="https://..."
                                        value={projectData.guide_url}
                                        onChange={(e) => setProjectData({ ...projectData, guide_url: e.target.value })}
                                    />
                                    <Input 
                                        label="Dataset URL (Optional)"
                                        type="url"
                                        placeholder="https://..."
                                        value={projectData.dataset_url}
                                        onChange={(e) => setProjectData({ ...projectData, dataset_url: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <Button type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
