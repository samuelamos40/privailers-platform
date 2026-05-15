import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Consultancy Services - Privailers Data Consult",
    description: "Expert data analysis services for SMBs in e-commerce, retail, and more.",
};

export default function ServicesPage() {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Consultancy Services</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                    We help Small and Medium Business (SMBs) unlock the power of their data to drive efficiency and growth through tailored analytics solutions.
                </p>
            </div>

            {/* Services Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', marginBottom: '6rem' }}>
                <Card padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        width: '3rem', height: '3rem', backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-blue)'
                    }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-blue)' }}>E-Commerce Analytics</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                        Optimize your online store with deep dives into customer behavior, cart abandonment, and sales trends.
                        We help you understand not just *what* is happening, but *why*.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                        {['Customer Segmentation & LTV Analysis', 'Conversion Rate Optimization (CRO)', 'Inventory Forecasting & Management', 'Marketing ROI Analysis'].map(item => (
                            <li key={item} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent-teal-dark)', marginRight: '0.75rem' }}>✓</span> {item}
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: 'auto' }}>
                        <Link href="/contact">
                            <Button variant="primary">Request Audit</Button>
                        </Link>
                    </div>
                </Card>

                <Card padding="lg" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        width: '3rem', height: '3rem', backgroundColor: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary-blue)'
                    }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path></svg>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-blue)' }}>Retail & SMB Solutions</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                        From local retail to growing SMBs, our data strategies identify cost-saving opportunities and revenue drivers
                        hidden in your daily operations.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                        {['Operational Efficiency Audits', 'Market Basket Analysis', 'Performance Dashboards (Tableau/PowerBI)', 'Supply Chain Optimization'].map(item => (
                            <li key={item} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent-teal-dark)', marginRight: '0.75rem' }}>✓</span> {item}
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: 'auto' }}>
                        <Link href="/contact">
                            <Button variant="primary">Get a Quote</Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Process Section */}
            <div style={{ marginBottom: '6rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center', color: 'var(--primary-blue)' }}>How We Work</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                    {[
                        { step: '1', title: 'Discovery', desc: 'We meet to understand your business goals, pain points, and current data landscape.' },
                        { step: '2', title: 'Audit & Analysis', desc: 'Our team cleans, processes, and analyzes your data to uncover hidden patterns.' },
                        { step: '3', title: 'Strategy', desc: 'We develop a data-driven roadmap with actionable recommendations.' },
                        { step: '4', title: 'Execution', desc: 'We assist in implementing changes and set up tracking to measure success.' }
                    ].map((step, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                            <div style={{
                                width: '3rem', height: '3rem', backgroundColor: 'var(--primary-blue)', color: 'white', fontWeight: 700, fontSize: '1.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                            }}>
                                {step.step}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Case Study Spotlight */}
            <div style={{ backgroundColor: '#f8fafc', padding: '4rem 2rem', borderRadius: '1rem', marginBottom: '6rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Case Study: Retail Refresh</h2>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--accent-teal-dark)', marginBottom: '1rem' }}>+25% Revenue Growth in 6 Months</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            A local fashion retailer was struggling with inventory management and stagnant sales. We implemented a data-driven inventory system and analyzed customer purchase history to create personalized marketing campaigns.
                        </p>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
                            <strong>Result:</strong> Reduced dead stock by 40% and increased repeat customer revenue by 25%.
                        </p>
                        <Link href="/contact" style={{ fontWeight: 600, color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center' }}>
                            See How We Can Help You &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tools We Use */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Powered by industry-standard tools:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', opacity: 0.7, fontSize: '1.25rem', fontWeight: 600, color: '#64748b' }}>
                    {['Python', 'SQL', 'Tableau', 'PowerBI', 'Excel', 'Google Analytics'].map(tool => (
                        <span key={tool}>{tool}</span>
                    ))}
                </div>
            </div>

            {/* Future Expansions */}
            <div style={{ backgroundColor: 'rgba(0, 184, 212, 0.05)', padding: '3rem', borderRadius: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-blue)' }}>Future Tracks & Expansions</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    We are constantly evolving. Coming soon to our service portfolio:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {['Advanced Data Science', 'Data Engineering Pipelines', 'Mathematical Modeling'].map(track => (
                        <div key={track} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 500,
                            color: 'var(--primary-light)'
                        }}>
                            <span style={{ color: 'var(--accent-teal)', fontSize: '1.25rem' }}>&bull;</span> {track}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
