"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Card from "@/components/ui/Card";
import CourseIcon from "@/components/ui/CourseIcon";

export default function Home() {
    const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            const { data } = await supabase.from('courses').select('*').limit(3);
            setFeaturedCourses(data || []);
            setLoading(false);
        };
        fetchCourses();
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', backgroundColor: 'rgba(56, 189, 248, 0.08)', color: '#38bdf8', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <span style={{ fontSize: '1.1rem' }}>🚀</span> Launching the Next Generation of Data Analysts
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: '900px', margin: '0 auto 1.5rem' }}>
                        Empowering <span style={{ color: 'var(--accent-teal)' }}>Insights.</span><br />
                        <span style={{ opacity: 0.7 }}>Driving Growth.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 3.5rem', lineHeight: 1.7, fontWeight: 400 }}>
                        Privailers Data Consult bridges the gap between raw data and business decisions. We offer premium consultancy and world-class training designed for impact.
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
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>500+</div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Students Trained</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>50+</div>
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
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading featured courses...</div>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <Card style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '1.5rem', height: '80px', display: 'flex', alignItems: 'center' }}>
                                <img src="/images/icons/data-analysis.png" alt="Analysis" style={{ height: '100%', width: 'auto' }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Data Analysis</h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem', flex: 1 }}>Deep dive into your business metrics. We uncover hidden trends and actionable insights to drive revenue.</p>
                            <Link href="/services"><Button variant="outline" size="sm">Learn More</Button></Link>
                        </Card>
                        <Card style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '1.5rem', height: '80px', display: 'flex', alignItems: 'center' }}>
                                <img src="/images/icons/sql.png" alt="Machine Learning" style={{ height: '100%', width: 'auto' }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Machine Learning</h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem', flex: 1 }}>Predictive models that help you anticipate market shifts. From churn prediction to sales forecasting.</p>
                            <Link href="/services"><Button variant="outline" size="sm">Learn More</Button></Link>
                        </Card>
                        <Card style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '1.5rem', height: '80px', display: 'flex', alignItems: 'center' }}>
                                <img src="/images/icons/general.png" alt="Training" style={{ height: '100%', width: 'auto' }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Corporate Training</h3>
                            <p style={{ color: '#64748b', marginBottom: '2rem', flex: 1 }}>Upskill your workforce. Custom training modules in Excel, Power BI, and SQL tailored to your team.</p>
                            <Link href="/services"><Button variant="outline" size="sm">Learn More</Button></Link>
                        </Card>
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
                                quote: "The Data Analysis Bootcamp completely changed my career trajectory. I went from a novice to landing a role at a fintech startup in just 4 months.",
                                author: "Sarah J.",
                                role: "Data Analyst @ PayStack"
                            },
                            {
                                quote: "Privailers' consultancy uncovered inefficiencies in our supply chain that saved us over ₦5M in the first quarter alone. Highly recommended.",
                                author: "Emmanuel O.",
                                role: "Operations Manager, RetailGiant"
                            },
                            {
                                quote: "The hands-on projects were the best part. I built a real portfolio that I could show to recruiters. The mentorship is top-notch.",
                                author: "David K.",
                                role: "Junior Data Scientist"
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
