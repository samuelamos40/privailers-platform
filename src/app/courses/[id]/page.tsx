"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/ui/LoginModal";

export default function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const resolvedParams = use(params);
    const courseId = resolvedParams.id;
    
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch Course
                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', courseId)
                    .single();
                    
                if (courseError) throw courseError;
                setCourse(courseData);

                // Fetch Curriculum (Modules)
                if (courseData) {
                    const { data: moduleData, error: moduleError } = await supabase
                        .from('modules')
                        .select('id, title, content, order')
                        .eq('course_id', courseId)
                        .order('order', { ascending: true });
                    
                    if (moduleError) throw moduleError;
                    setModules(moduleData || []);
                }
            } catch (err) {
                console.error("Error fetching course details:", err);
                setCourse(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId]);


    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}><Navbar /><div style={{ padding: '8rem 2rem', textAlign: 'center', flex: 1, color: '#38bdf8', fontSize: '1.25rem', fontWeight: 600 }}>Loading premium course content...</div><Footer /></div>;
    if (!course) return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}><Navbar /><div style={{ padding: '8rem 2rem', textAlign: 'center', flex: 1, color: '#cbd5e1', fontSize: '1.25rem' }}>Course not found. (ID mismatch or deleted)</div><Footer /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar />
            
            {/* Header / Hero */}
            <header style={{ 
                backgroundColor: '#1e293b', 
                color: 'white', 
                padding: '6rem 1rem 4rem',
                borderBottom: '4px solid #38bdf8'
            }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.875rem', fontWeight: 600,
                            padding: '0.25rem 0.75rem', borderRadius: '4px',
                            backgroundColor: course.tier === 'paid' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                            color: course.tier === 'paid' ? '#fcd34d' : '#86efac'
                        }}>
                            {course.tier === 'paid' ? 'PREMIUM COURSE' : 'FREE COURSE'}
                        </span>
                    </div>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        {course.title}
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '800px', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                        {course.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        {user ? (
                            <Link href={course.tier === 'paid' ? `/checkout?type=course&id=${course.id}` : `/student/courses/${course.id}`}>
                                <Button variant="primary" size="lg" style={{ backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 700, padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                                    {course.tier === 'paid' ? `Enroll for ₦${course.price?.toLocaleString() || '0'}` : 'Enroll for Free'}
                                </Button>
                            </Link>
                        ) : (
                            <Button 
                                onClick={() => setIsLoginModalOpen(true)}
                                variant="primary" 
                                size="lg" 
                                style={{ backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 700, padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                            >
                                {course.tier === 'paid' ? `Enroll for ₦${course.price?.toLocaleString() || '0'}` : 'Enroll for Free'}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1rem', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
                    
                    {/* Left Column: Curriculum */}
                    <div style={{ flex: 2 }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginBottom: '2rem' }}>
                            Course Curriculum
                        </h2>
                        
                        {modules.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {modules.map((mod, index) => (
                                    <div key={mod.id} style={{ 
                                        backgroundColor: 'white', 
                                        padding: '1.5rem', 
                                        borderRadius: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        gap: '1.5rem',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div style={{ 
                                            width: '40px', height: '40px', 
                                            backgroundColor: '#f1f5f9', 
                                            color: '#64748b',
                                            borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, flexShrink: 0
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                                                {mod.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Curriculum is still being updated for this course.</p>
                        )}
                    </div>

                    {/* Right Column: Key Details */}
                    <div style={{ flex: 1 }}>
                        <div style={{ 
                            backgroundColor: 'white', 
                            padding: '2rem', 
                            borderRadius: '1rem',
                            border: '1px solid #e2e8f0',
                            position: 'sticky',
                            top: '2rem'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
                                Course Features
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#475569', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>📹</span> High-quality video lessons
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>💻</span> Hands-on projects
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>📱</span> Access on mobile and desktop
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.25rem' }}>🏆</span> Certificate of completion
                                </li>
                            </ul>
                            
                            <hr style={{ margin: '2rem 0', borderColor: '#e2e8f0' }} />
                            
                            <div style={{ fontWeight: 700, fontSize: '2rem', color: '#0f172a', marginBottom: '1rem', textAlign: 'center' }}>
                                {course.tier === 'paid' ? `₦${course.price?.toLocaleString() || '0'}` : 'Free'}
                            </div>
                            
                            {user ? (
                                <Link href={course.tier === 'paid' ? `/checkout?type=course&id=${course.id}` : `/student/courses/${course.id}`} style={{ display: 'block' }}>
                                    <Button variant="primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}>
                                        {course.tier === 'paid' ? 'Proceed to Payment' : 'Start Learning'}
                                    </Button>
                                </Link>
                            ) : (
                                <Button 
                                    onClick={() => setIsLoginModalOpen(true)}
                                    variant="primary" 
                                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}
                                >
                                    {course.tier === 'paid' ? 'Proceed to Payment' : 'Start Learning'}
                                </Button>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            <Footer />

            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)}
                redirectAfterAuth={
                    course?.tier === 'paid' 
                        ? `/checkout?type=course&id=${course.id}` 
                        : `/student/courses/${course.id}`
                }
            />
        </div>
    );
}
