"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setCourses(data);
            setLoading(false);
        };

        fetchCourses();
    }, []);

    if (loading) return <div>Loading courses...</div>;

    return (
        <div>
            <div className="portal-header">
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 700, color: '#1e293b', margin: 0 }}>Course Management</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Manage video modules, curricula, and courses</p>
                </div>
                <Link href="/admin/courses/create">
                    <Button variant="primary">Create New Course</Button>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                {courses.map(course => (
                    <Card key={course.id} padding="lg">
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: course.tier === 'paid' ? '#fef3c7' : '#e0f2fe',
                                color: course.tier === 'paid' ? '#92400e' : '#0369a1',
                                borderRadius: '1rem',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                            }}>
                                {course.tier}
                            </span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>{course.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {course.description}
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link href={`/admin/courses/${course.id}`} style={{ width: '100%' }}>
                                <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }}>
                                    Manage Content
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
