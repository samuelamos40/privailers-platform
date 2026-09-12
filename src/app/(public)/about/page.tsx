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
                <p style={{ fontSize: '1.25rem', lineHeight: 1.8, maxWidth: '900px', margin: '0 auto', color: 'var(--text-muted)' }}>
                    Privailers Data Consult is a Nigerian-based EdTech and data analytics consultancy poised to bridge the critical skills gap in Africa's digital economy. We empower businesses to make smarter, data-driven decisions while equipping individuals with practical, job-ready analytical skills.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '6rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Our Vision & Mission</h2>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Vision</h3>
                    <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        To empower businesses with data-driven insights and develop a new generation of highly skilled, globally competitive data professionals across Africa.
                    </p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>Mission</h3>
                    <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>
                        To deliver accessible, high-quality data consulting and an integrated EdTech learning ecosystem that bridges the gap between business intelligence needs and professional career development.
                    </p>
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
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center', color: 'var(--primary-blue)' }}>Our Journey & Impact</h2>
                <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)' }}>
                    {[
                        { year: '2025', title: 'The Beginning', desc: 'Founded with a vision to make data accessible to local businesses and launched our first training cohort to address the growing demand for skilled data analysts.' },
                        { year: '2026', title: 'Platform Launch & Growth', desc: 'Unveiled our proprietary digital learning ecosystem. Our inaugural Advanced Data Analytics bootcamp successfully graduated a cohort where students immediately secured full-time employment and internships.' },
                        { year: 'Future', title: 'Privailers Innovation Hub', desc: 'Expanding our physical footprint with plans for the Privailers Innovation Hub in Ado-Ekiti, further solidifying our position in Nigeria\'s rapidly expanding EdTech market.' }
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
                        name="Aguoha Confidence Emeka"
                        role="Data Analyst"
                        bio="A dedicated analyst focused on uncovering hidden trends and driving data-informed decisions."
                        imageUrl="/images/team/aguoha.jpg"
                    />
                    <TeamMemberCard
                        name="Muhammmad Yunusa Liman"
                        role="Data Analyst"
                        bio="Passionate about turning raw data into actionable insights for business growth and operational efficiency."
                        imageUrl="/images/team/muhammad.jpg"
                    />
                    <TeamMemberCard
                        name="Duru Grace Chigozie"
                        role="Data Analyst"
                        bio="Specializes in data storytelling and visualization, helping organizations make sense of complex datasets."
                        imageUrl="/images/team/duru.jpg"
                    />
                </div>
            </div>
        </div>
    );
}
