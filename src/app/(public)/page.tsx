"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Card from "@/components/ui/Card";
import CourseIcon from "@/components/ui/CourseIcon";
import { BarChart3, BrainCircuit, GraduationCap, ArrowRight, Database, Globe2, Calculator, BookOpen } from "lucide-react";

export default function Home() {
    const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try { sessionStorage.removeItem("privailers_logging_out"); } catch (e) {}
            try {
                const cached = sessionStorage.getItem("privailers_home_courses");
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                        setFeaturedCourses(parsed);
                        setLoading(false);
                    }
                }
            } catch (e) {}
        }

        let isMounted = true;
        const fetchCourses = async () => {
            try {
                const { data } = await supabase
                    .from('courses')
                    .select('id, title, description, price, tier')
                    .limit(3);
                if (data && isMounted) {
                    setFeaturedCourses(data);
                    try {
                        sessionStorage.setItem("privailers_home_courses", JSON.stringify(data));
                    } catch (e) {}
                }
            } catch (err) {
                console.error("Error fetching featured courses:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchCourses();
        return () => { isMounted = false; };
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                padding: '10rem 0 8rem',
                background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', background: 'var(--accent-teal)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '30%', height: '30%', background: 'var(--primary-blue)', filter: 'blur(120px)', opacity: 0.2, borderRadius: '50%' }} />

                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: '900px', margin: '0 auto 1.5rem' }}>
                        Empowering <span style={{ color: 'var(--accent-teal)' }}>Insights.</span><br />
                        <span style={{ opacity: 0.7 }}>Driving Growth.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 3.5rem', lineHeight: 1.7, fontWeight: 400 }}>
                        Privailers Data Consult bridges the gap between high-demand tech skills and enterprise intelligence. We provide a comprehensive EdTech academy with self-paced courses and live bootcamps, automated data pipelines, analytics-ready web platforms, and applied mathematical modeling & simulations.
                    </p>
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/courses">
                            <Button variant="accent" size="lg" style={{ minWidth: '200px', height: '60px', fontSize: '1.1rem', boxShadow: '0 10px 15px -3px rgba(0, 184, 212, 0.2)' }}>
                                Start Learning
                            </Button>
                        </Link>
                        <Link href="/services">
                            <Button variant="outline" size="lg" style={{
                                minWidth: '200px', height: '60px', fontSize: '1.1rem',
                                color: 'white', borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.02)'
                            }}>
                                Hire Our Team
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>


            {/* Stats Section */}
            <section style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>75+</div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Students Trained</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>2+</div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Corporate Projects</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>98%</div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Satisfaction Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses Section */}
            <section style={{ padding: '6rem 0', backgroundColor: '#f8fafc' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Featured Courses</h2>
                            <p style={{ color: '#64748b', maxWidth: '600px' }}>Start your journey with our top-rated programs.</p>
                        </div>
                        <Link href="/courses">
                            <Button variant="outline">View All Courses →</Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    background: 'white',
                                    borderRadius: '1rem',
                                    border: '1px solid #e2e8f0',
                                    padding: '1.5rem',
                                    height: '380px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }}>
                                    <div style={{ height: '180px', backgroundColor: '#f1f5f9', borderRadius: '0.75rem', marginBottom: '1.25rem' }} />
                                    <div style={{ height: '20px', width: '35%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '0.75rem' }} />
                                    <div style={{ height: '24px', width: '75%', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '0.75rem' }} />
                                    <div style={{ height: '16px', width: '90%', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: 'auto' }} />
                                    <div style={{ height: '40px', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', marginTop: '1rem' }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {featuredCourses.map(course => (
                                <Card key={course.id} style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
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
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Services Preview */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>What We Do</h2>
                        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Calculate your next move with precision. Our services are tailored for impact.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {[
                            {
                                title: "EdTech Academy & Course Marketplace",
                                desc: "Empowering individuals with in-demand data skills. We sell premium self-paced online courses and conduct live cohort-based bootcamps with hands-on real-world projects and career support.",
                                image: "/images/services/corporate-training.jpg",
                                icon: <BookOpen size={24} color="#f59e0b" />,
                                tags: ["Self-Paced Courses", "Live Cohorts", "Job Placement Support"],
                                link: "/courses"
                            },
                            {
                                title: "Data Pipelines & ETL Engineering",
                                desc: "We design and deploy automated data pipelines that ingest, clean, and consolidate disparate data into centralized, analytics-ready cloud data warehouses.",
                                image: "/images/services/data-analysis.jpg",
                                icon: <Database size={24} color="#0284c7" />,
                                tags: ["Automated ETL/ELT", "Data Warehousing", "Stream Processing"],
                                link: "/services"
                            },
                            {
                                title: "Business Intelligence & BI",
                                desc: "Deep dive into your business metrics. We uncover hidden trends, automate executive reporting, and provide actionable insights to drive revenue growth.",
                                image: "/images/services/data-analysis.jpg",
                                icon: <BarChart3 size={24} color="#00b4d8" />,
                                tags: ["Executive Dashboards", "Power BI & Tableau", "Revenue Growth"],
                                link: "/services"
                            },
                            {
                                title: "Analytics-Ready Web Platforms",
                                desc: "We build modern web applications and platforms engineered with built-in data extraction and user tracking for real-time operational analysis.",
                                image: "/images/services/data-analysis.jpg",
                                icon: <Globe2 size={24} color="#0ea5e9" />,
                                tags: ["Custom Web Apps", "Telemetry Tracking", "Data Extraction"],
                                link: "/services"
                            },
                            {
                                title: "Mathematical Modeling & Simulation",
                                desc: "Formulate complex real-world operations into rigorous mathematical models. We deploy stochastic simulations, Monte Carlo algorithms, and numerical optimization to solve high-stakes challenges.",
                                image: "/images/services/machine-learning.jpg",
                                icon: <Calculator size={24} color="#8b5cf6" />,
                                tags: ["Stochastic Modeling", "Monte Carlo Simulations", "Numerical Optimization"],
                                link: "/services"
                            },
                            {
                                title: "Corporate Team Training",
                                desc: "Upskill your workforce with hands-on, instructor-led bootcamps in Excel, SQL, and Power BI tailored specifically to your organization's workflow.",
                                image: "/images/services/corporate-training.jpg",
                                icon: <GraduationCap size={24} color="#10b981" />,
                                tags: ["Custom Bootcamps", "Hands-on Projects", "Team Mastery"],
                                link: "/services"
                            }
                        ].map((service, i) => (
                            <div key={i} style={{
                                backgroundColor: 'white',
                                borderRadius: '1.25rem',
                                border: '1px solid #e2e8f0',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div style={{ position: 'relative', height: '200px', width: '100%', overflow: 'hidden' }}>
                                    <img 
                                        src={service.image} 
                                        alt={service.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 60%)'
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '1rem',
                                        left: '1.25rem',
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '0.75rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    }}>
                                        {service.icon}
                                    </div>
                                </div>
                                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a' }}>
                                        {service.title}
                                    </h3>
                                    <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.975rem', flex: 1 }}>
                                        {service.desc}
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
                                        {service.tags.map((t, idx) => (
                                            <span key={idx} style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: '999px',
                                                backgroundColor: '#f1f5f9',
                                                color: '#475569'
                                            }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    <Link href={service.link} style={{ textDecoration: 'none' }}>
                                        <Button variant="outline" size="sm" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                            Learn More <ArrowRight size={16} />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white', borderTop: '1px solid #f1f5f9' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Success Stories</h2>
                        <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Hear from the individuals and businesses we've helped grow.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[
                            {
                                quote: "Joining the Privailers Data Analytics Bootcamp was a game-changer for me. The classes were practical, beginner-friendly, and highly impactful. I gained hands-on experience with tools like Excel and I now feel confident analyzing data and drawing meaningful insights. I highly recommend it to anyone looking to build real data skills.",
                                author: "Aichenede Joy Omonigho",
                                role: "Data Analytics Student"
                            },
                            {
                                quote: "Enrolling in the one-month data analysis program at Privailers Data Consult was a game-changer for my career. In just four weeks, I went from having zero technical knowledge to being comfortable cleaning data and building insightful dashboards. The curriculum is incredibly structured, and the focus on practical, real-world projects made all the difference.",
                                author: "Oyinlola Abdulrahman O.",
                                role: "Data Analytics Student"
                            },
                            {
                                quote: "This Data Analytics Bootcamp has been a transformative experience! I've gained practical skills in data analysis and visualization. The hands-on projects and expert instructors have helped me unlock my potential. I'm now confident to drive data-driven decisions and take my career to the next level!",
                                author: "Adeojo Rildwan",
                                role: "Data Analytics Student"
                            }
                        ].map((testimonial, i) => (
                            <div key={i} style={{
                                padding: '2rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '1rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ color: '#38bdf8', fontSize: '2rem', marginBottom: '1rem', lineHeight: 1 }}>❝</div>
                                <p style={{ color: '#475569', fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                    "{testimonial.quote}"
                                </p>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{testimonial.author}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{testimonial.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        borderRadius: '2rem',
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        color: 'white',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Ready to Transform Your Career?</h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                            Join hundreds of students who have landed jobs at top tech companies after training with us.
                        </p>
                        <Link href="/register">
                            <Button variant="primary" size="lg" style={{ backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 700 }}>
                                Create Free Student Account
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
