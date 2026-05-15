import Card from "@/components/ui/Card";
import TeamMemberCard from "@/components/ui/TeamMemberCard";
import type { Metadata } from "next";
import Image from "next/image";



export const metadata: Metadata = {
    title: "About Us - Privailers Data Consult",
    description: "Our mission is to bridge the gap between complex datasets and actionable business strategies.",
};

export default function AboutPage() {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>About Privailers</h1>
                <p style={{ fontSize: '1.25rem', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)' }}>
                    We are a team of data scientists, educators, and strategists dedicated to making data accessible, understandable, and actionable for everyone.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '6rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Our Mission</h2>
                    <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        To democratize data analysis by providing high-quality consultancy for businesses and practical, top-tier training for aspiring data professionals.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: 'var(--accent-teal-dark)', marginRight: '0.75rem' }}>✓</span>
                            Empowering informed decision-making.
                        </li>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: 'var(--accent-teal-dark)', marginRight: '0.75rem' }}>✓</span>
                            Bridging the skills gap in the tech industry.
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: 'var(--accent-teal-dark)', marginRight: '0.75rem' }}>✓</span>
                            Fostering a community of continuous learners.
                        </li>
                    </ul>
                </div>
                <div style={{ position: 'relative', height: '100%', minHeight: '350px', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                    <Image
                        src="/images/mission.png"
                        alt="Privailers Team Collaborating"
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Core Values */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center', color: 'var(--primary-blue)' }}>Core Values</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    {[
                        { title: 'Accuracy', desc: 'Precision in every insight we deliver.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> },
                        { title: 'Clarity', desc: 'Making complex data simple to understand.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="m8 22 4-10 4 10"></path></svg> },
                        { title: 'Empowerment', desc: 'Giving you the tools to succeed.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg> },
                        { title: 'Integrity', desc: 'Honest, transparent, and ethical data practices.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> }
                    ].map((value, i) => (
                        <Card key={i} style={{ textAlign: 'center', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '1.25rem', 
                                backgroundColor: '#f1f5f9', display: 'flex', 
                                alignItems: 'center', justifyContent: 'center', 
                                marginBottom: '1.5rem', color: 'var(--accent-teal-dark)'
                            }}>{value.icon}</div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>{value.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{value.desc}</p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Our Story / Timeline */}
            <div style={{ marginBottom: '6rem', backgroundColor: '#f8fafc', padding: '4rem 2rem', borderRadius: '1rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center', color: 'var(--primary-blue)' }}>Our Journey</h2>
                <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)' }}>
                    {[
                        { year: '2018', title: 'The Beginning', desc: 'Founded with a single laptop and a vision to make data accessible to local businesses.' },
                        { year: '2020', title: 'First Training Cohort', desc: 'Launched our training arm to address the growing demand for skilled data analysts.' },
                        { year: '2022', title: 'Corporate Partnerships', desc: 'Partnered with major retail chains to optimize their supply chain operations.' },
                        { year: '2024', title: 'Platform Launch', desc: 'Unveiling our digital platform to scale our impact globally.' }
                    ].map((event, i) => (
                        <div key={i} style={{ marginBottom: '3rem', position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '-2.6rem',
                                top: '0',
                                width: '1.2rem',
                                height: '1.2rem',
                                borderRadius: '50%',
                                backgroundColor: 'var(--accent-teal)',
                                border: '4px solid #fff'
                            }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-teal-dark)', textTransform: 'uppercase', letterSpacing: '1px' }}>{event.year}</span>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--primary-blue)' }}>{event.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{event.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Meet the Team */}
            <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center', color: 'var(--primary-blue)' }}>Meet the Team</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <TeamMemberCard
                        name="Dr. Amina Z."
                        role="Founder & Principal Consultant"
                        bio="With over 15 years in data science, Amina leads the consultancy arm, helping businesses translate numbers into growth."
                    />
                    <TeamMemberCard
                        name="John Doe"
                        role="Lead Instructor"
                        bio="A passionate educator and former Data Analyst at TechCorp, John shapes the curriculum for our academy."
                    />
                    <TeamMemberCard
                        name="Sarah K."
                        role="Business Strategy Lead"
                        bio="Sarah combines her MBA background with data insights to ensure our solutions drive real ROI for clients."
                    />
                </div>
            </div>
        </div>
    );
}
