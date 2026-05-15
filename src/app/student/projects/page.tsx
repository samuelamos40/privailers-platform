"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Mocking the same "LightCard" style for consistency
const ProjectCard = ({ project }: { project: any }) => (
    <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
        <div>
            <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#3b82f6',
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                {project.course?.title || 'General Course'}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                {project.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{project.description}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
            {project.due_date && (
                <div style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Due: {new Date(project.due_date).toLocaleDateString()}
                </div>
            )}
            <Link href={`/student/projects/${project.id}`}>
                <button style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontWeight: 600,
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer'
                }}>
                    View Details
                </button>
            </Link>
        </div>
    </div>
);

export default function StudentProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        // The RLS policy on 'projects' table ensures we ONLY receive projects
        // for courses the user is enrolled in.
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                course:courses(title)
            `)
            .order('due_date', { ascending: true });

        if (error) console.error("Error fetching projects:", error);

        setProjects(data || []);
        setLoading(false);
    };

    if (loading) return <div style={{ padding: '3rem' }}>Loading assignments...</div>;

    return (
        <div style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b' }}>Projects & Assignments</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    Practical work for your enrolled courses.
                </p>
            </div>

            {projects.length > 0 ? (
                <div>
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    border: '2px dashed #e2e8f0'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>All Caught Up!</h3>
                    <p style={{ color: '#64748b' }}>You don't have any pending projects or assignments right now.</p>
                </div>
            )}
        </div>
    );
}
