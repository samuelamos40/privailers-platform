"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CourseIcon from "@/components/ui/CourseIcon";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const cached = sessionStorage.getItem("privailers_courses_cache");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                        setCourses(parsed);
                        setLoading(false);
                    }
                }
            } catch (e) {}
        }

        let isMounted = true;

        const fetchCourses = async () => {
            try {
                // Optimized lightweight select (avoids heavy blobs or unused fields)
                const { data, error } = await supabase
                    .from('courses')
                    .select('id, title, description, price, tier, published')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data && isMounted) {
                    setCourses(data);
                    try {
                        sessionStorage.setItem("privailers_courses_cache", JSON.stringify(data));
                    } catch (e) {}
                }
            } catch (err) {
                console.error("Error fetching courses:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchCourses();
        return () => { isMounted = false; };
    }, []);

    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main className="courses-main" style={{ flex: 1, padding: '4rem 0', backgroundColor: '#f8fafc' }}>
                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                    .skeleton-card {
                        animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                        background: #ffffff;
                        border-radius: 1rem;
                        border: 1px solid #e2e8f0;
                        padding: 1.5rem;
                        height: 380px;
                        display: flex;
                        flex-direction: column;
                    }
                    @media (max-width: 768px) {
                        .courses-main {
                            padding: 2rem 0 !important;
                        }
                        .page-title {
                            font-size: 2rem !important;
                        }
                        .page-subtitle {
                            font-size: 1rem !important;
                        }
                    }
                `}</style>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1 className="page-title" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                            Course Catalog
                        </h1>
                        <p className="page-subtitle" style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                            Master the tools of the trade. From Excel basics to advanced Machine Learning.
                        </p>
                        
                        {/* Search Bar */}
                        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
                            <input 
                                type="text"
                                placeholder="Search courses... (e.g. SQL, Excel)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '999px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-teal)'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="skeleton-card">
                                    <div style={{ height: '180px', backgroundColor: '#e2e8f0', borderRadius: '0.75rem', marginBottom: '1.25rem' }} />
                                    <div style={{ height: '24px', width: '40%', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '0.75rem' }} />
                                    <div style={{ height: '20px', width: '80%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} />
                                    <div style={{ height: '16px', width: '90%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: 'auto' }} />
                                    <div style={{ height: '40px', backgroundColor: '#e2e8f0', borderRadius: '0.5rem', marginTop: '1rem' }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2rem' }}>
                            {filteredCourses.length > 0 ? filteredCourses.map(course => (
                                <Card key={course.id} style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', borderRadius: '1rem', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '200px',
                                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                        margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderTopLeftRadius: '1rem',
                                        borderTopRightRadius: '1rem',
                                        padding: '1.5rem'
                                    }}>
                                        <CourseIcon title={course.title} size="lg" />
                                    </div>
                                    <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 600,
                                            padding: '0.25rem 0.5rem', borderRadius: '4px',
                                            backgroundColor: course.tier === 'paid' ? '#fef3c7' : '#dcfce7',
                                            color: course.tier === 'paid' ? '#d97706' : '#16a34a'
                                        }}>
                                            {course.tier === 'paid' ? 'PREMIUM' : 'FREE'}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                                        {course.title}
                                    </h3>
                                    <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {course.description}
                                    </p>
                                    <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f172a' }}>
                                            {course.tier === 'paid' ? `₦${course.price?.toLocaleString() || '0'}` : 'Free'}
                                        </div>
                                        <Link href={`/courses/${course.id}`}>
                                            <Button variant="primary">View Course</Button>
                                        </Link>
                                    </div>
                                </Card>
                            )) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                                    No courses found matching your search.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
