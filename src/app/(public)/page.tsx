import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section style={{
                padding: '6rem 0',
                background: 'linear-gradient(135deg, var(--primary-blue) 0%, #001f3f 100%)',
                color: 'var(--white)',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        lineHeight: 1.2
                    }}>
                        Empowering Insight. <br />
                        <span style={{ color: 'var(--accent-teal)' }}>Driving Growth.</span>
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        opacity: 0.9,
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.6
                    }}>
                        We provide expert data consultancy for businesses and hands-on training for the next generation of data analysts.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="/services">
                            <Button variant="accent" size="lg" style={{ minWidth: '160px', justifyContent: 'center' }}>
                                For Business
                            </Button>
                        </Link>
                        <Link href="/courses">
                            <Button variant="outline" size="lg" style={{
                                minWidth: '160px',
                                justifyContent: 'center',
                                color: 'var(--white)',
                                borderColor: 'var(--white)'
                            }}>
                                For Students
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Section / Dual Focus */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {/* Consultancy Card */}
                        <div style={{
                            backgroundColor: 'var(--white)',
                            padding: '2.5rem',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: 'rgba(0, 51, 102, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: 'var(--primary-blue)'
                            }}>
                                {/* Icon placeholder */}
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-blue)' }}>
                                Data Consultancy
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                Transform your raw data into actionable strategies. We serve SMBs in e-commerce, retail, and more with precise analysis.
                            </p>
                            <Link href="/services" style={{ color: 'var(--primary-blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                                Explore Services &rarr;
                            </Link>
                        </div>

                        {/* Training Card */}
                        <div style={{
                            backgroundColor: 'var(--white)',
                            padding: '2.5rem',
                            borderRadius: '1rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: 'rgba(0, 184, 212, 0.1)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem',
                                color: 'var(--accent-teal-dark)'
                            }}>
                                {/* Icon placeholder */}
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--primary-blue)' }}>
                                Academy & Training
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                                Master Excel, SQL, Python, and Machine Learning. Hands-on projects and mentorship to launch your data career.
                            </p>
                            <Link href="/courses" style={{ color: 'var(--accent-teal-dark)', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                                View Courses &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
