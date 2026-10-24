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
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-blue)', wordBreak: 'break-word' }}>About Privailers Data Consult</h1>
                <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', lineHeight: 1.8, maxWidth: '980px', margin: '0 auto', color: 'var(--text-muted)' }}>
                    Privailers Data Consult is a Nigerian-based EdTech and data analytics consultancy poised to bridge the critical skills gap in Africa&apos;s digital economy. We equip individuals with practical, career-defining skills through our self-paced course marketplace and live cohort bootcamps, while empowering businesses with automated data pipelines, analytics-ready web platforms, and advanced mathematical modeling & simulations.
                </p>
            </div>

            {/* Key Pillars / Model */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', marginBottom: '6rem' }}>
                <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>⚡</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>Dual-Impact Model</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        We unite enterprise-grade corporate data consulting and quantitative modeling with a comprehensive, proprietary EdTech platform—offering self-paced courses for purchase, live cohort bootcamps, and personalized individual training.
                    </p>
                </div>

                <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🎓</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>Course Marketplace & Individual Training</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        Our digital marketplace empowers learners with premium self-paced video courses, hands-on portfolio projects, and intensive 1-on-1 individual training designed to launch high-paying tech careers.
                    </p>
                </div>

                <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🌐</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>Data Pipelines & Web Extraction</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        We architect automated ETL data pipelines and engineer analytics-ready web platforms with custom telemetry to turn dispersed data into real-time operational intelligence.
                    </p>
                </div>

                <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>📐</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>Mathematical Modeling & Simulation</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        We formulate real-world operations using deterministic & stochastic mathematical models, Monte Carlo simulations, and numerical optimization to solve high-stakes business and financial problems with precision.
                    </p>
                </div>

                <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🎯</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>Proven Traction & Job Placement</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        Our inaugural Advanced Data Analytics bootcamp successfully graduated a cohort where two students secured full-time employment and one secured an internship immediately upon completion.
                    </p>
                </div>

                <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>🏛️</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>Team & Innovation Hub</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        Powered by a multidisciplinary team of 10 professionals—mathematicians, data scientists, analysts, and software engineers—with strategic plans for a physical Privailers Innovation Hub in Ado-Ekiti.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '6rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--primary-blue)' }}>Our Vision & Mission</h2>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-teal-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🔭</span> Vision
                        </h3>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                            To empower businesses with mathematically sound, data-driven insights and develop a new generation of highly skilled, globally competitive data analysts, quantitative modelers, and data professionals across Africa.
                        </p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-teal-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🚀</span> Mission
                        </h3>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                            To deliver accessible, high-precision mathematical modeling, data consulting, and an integrated EdTech learning marketplace offering high-value self-paced courses and individual trainings that bridge the gap between enterprise intelligence needs and professional career mastery.
                        </p>
                    </div>
                </div>
                <div style={{ position: 'relative', height: '400px', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
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
                        { title: 'Mathematical Rigor', desc: 'Grounded in quantitative precision and scientific exactness.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> },
                        { title: 'Clarity', desc: 'Making complex data and mathematical models intuitive to understand.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="m8 22 4-10 4 10"></path></svg> },
                        { title: 'Empowerment', desc: 'Giving individuals and teams practical skills to excel.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg> },
                        { title: 'Integrity', desc: 'Honest, transparent, and ethical data and modeling practices.', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> }
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
                        { year: '2025', title: 'Inception & Quantitative Foundations', desc: 'Founded with a mission to bridge Africa\'s digital skills gap, uniting mathematical modeling with practical data analytics and launching our inaugural training bootcamp.' },
                        { year: '2026', title: 'Engineering, Simulation & Marketplace Scale', desc: 'Expanded into mathematical simulation, automated data pipelines, custom web extraction platforms, and an open digital marketplace selling self-paced courses and cohort-based individual training with proven employment placements.' },
                        { year: 'Expansion', title: 'Privailers Innovation Hub', desc: 'Expanding our physical footprint with the Privailers Innovation Hub in Ado-Ekiti, anchoring local tech incubation, quantitative research, and advanced talent development.' }
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
                        name="Caleb Kpesa Iyako"
                        role="MD"
                        bio="Managing Director steering strategic direction, quantitative growth, and educational innovation across the platform."
                        imageUrl="/images/team/caleb-iyako.jpg"
                    />
                    <TeamMemberCard
                        name="Catherine Chimezie"
                        role="Administrative Officer"
                        bio="Oversees daily operations, student outreach, program administration, and organizational workflow coordination."
                        imageUrl="/images/team/catherine-chimezie.jpg"
                    />
                    <TeamMemberCard
                        name="Adio Boluwatife Florence"
                        role="Secretary"
                        bio="Manages executive communications, documentation, scheduling, and administrative correspondence."
                        imageUrl="/images/team/florence-adio.jpg"
                    />
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
                        imageUrl="/images/team/muhammad.jpg?v=2"
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
