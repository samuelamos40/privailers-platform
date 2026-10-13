"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function InstructorCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const cacheKey = `privailers_instructor_courses_${session.user.id}`;
            if (typeof window !== 'undefined') {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    try {
                        setCourses(JSON.parse(cached));
                        setLoading(false);
                    } catch (e) {}
                }
            }

            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('instructor_id', session.user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setCourses(data);
                if (typeof window !== 'undefined') {
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify(data));
                    } catch (e) {}
                }
            }
            setLoading(false);
        };

        fetchCourses();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
            <div style={{ height: '40px', width: '250px', backgroundColor: '#e2e8f0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ height: '220px', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: '220px', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }}></div>
            </div>
            <style jsx>{`@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }`}</style>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Course Management</h1>
                <Link href="/instructor/courses/create">
                    <Button variant="primary">Create New Course</Button>
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
                            <Link href={`/instructor/courses/${course.id}`} style={{ width: '100%' }}>
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
