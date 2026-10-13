import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import type { Metadata } from "next";
import { Database, Globe2, BarChart3, GraduationCap, ArrowRight, CheckCircle2, Calculator, BookOpen } from "lucide-react";

export const metadata: Metadata = {
    title: "Consulting & Engineering Services - Privailers Data Consult",
    description: "Mathematical modeling, quantitative simulations, automated data pipelines, analytics-ready web development, individual course marketplace, and corporate training.",
};

export default function ServicesPage() {
    const services = [
        {
            icon: <BookOpen size={28} color="#f59e0b" />,
            title: "EdTech Academy & Individual Course Marketplace",
            desc: "Learn from anywhere with our complete digital learning ecosystem. We sell high-impact self-paced courses and run live, cohort-based bootcamps designed to take individuals from beginner to job-ready data professionals.",
            features: [
                "Self-paced video courses with lifetime access & certificates",
                "Live cohort-based bootcamps led by senior data analysts",
                "Hands-on portfolio projects using authentic real-world datasets",
                "1-on-1 mentorship, resume reviews, & direct internship/job placement support"
            ],
            badge: "Individual Learning",
            ctaLink: "/courses",
            ctaText: "Browse & Buy Courses"
        },
        {
            icon: <Database size={28} color="#00b4d8" />,
            title: "Data Pipelines & ETL Infrastructure",
            desc: "We architect and deploy scalable, automated data pipelines that ingest, transform, and load disparate data streams into unified data lakes and warehouses. Keep your business metrics fresh, structured, and audit-ready.",
            features: [
                "Automated ETL/ELT pipeline architecture & workflow orchestration",
                "Cloud data warehousing & migration (PostgreSQL, BigQuery, Snowflake)",
                "Real-time stream and batch data ingestion engines",
                "Automated data validation, quality control, and governance"
            ],
            badge: "Data Engineering",
            ctaLink: "/contact",
            ctaText: "Inquire About Pipelines"
        },
        {
            icon: <BarChart3 size={28} color="#10b981" />,
            title: "Business Intelligence & Executive Analytics",
            desc: "Convert raw numbers into strategic growth engines. We build interactive executive dashboards, automate multi-department reporting, and deploy predictive models to forecast demand and eliminate customer churn.",
            features: [
                "Interactive executive dashboards (Power BI & Tableau)",
                "Customer segmentation, churn mitigation, & LTV modeling",
                "Operational cost-reduction audits & financial performance tracking",
                "Automated multi-department KPI reporting systems"
            ],
            badge: "Business Intelligence",
            ctaLink: "/contact",
            ctaText: "Request BI Consultation"
        },
        {
            icon: <Globe2 size={28} color="#0284c7" />,
            title: "Analytics-Ready Web Platforms & Data Extraction",
            desc: "We develop high-performance web applications and custom data extraction architectures engineered specifically to capture user telemetry, competitive market signals, and operational metrics for immediate analytical consumption.",
            features: [
                "Custom web development with embedded telemetry and event tracking",
                "Automated web scraping & structured data extraction engines",
                "API integrations, webhook dispatchers, and connector tools",
                "Market intelligence and pricing extraction pipelines"
            ],
            badge: "Digital Platforms",
            ctaLink: "/contact",
            ctaText: "Request Web Solution"
        },
        {
            icon: <Calculator size={28} color="#8b5cf6" />,
            title: "Mathematical Modeling & Quantitative Simulation",
            desc: "We translate complex real-world dynamics into rigorous mathematical models and numerical simulations. From stochastic risk forecasting to operations research and algorithmic optimization, we give organizations mathematically backed confidence.",
            features: [
                "Deterministic & stochastic mathematical modeling",
                "Monte Carlo simulations & multi-variable sensitivity analysis",
                "Operations research, supply chain & resource optimization algorithms",
                "Statistical inference, probability modeling & predictive stress testing"
            ],
            badge: "Applied Mathematics",
            ctaLink: "/contact",
            ctaText: "Request Modeling Consultation"
        },
        {
            icon: <GraduationCap size={28} color="#ec4899" />,
            title: "Corporate Training & Team Upskilling",
            desc: "Upskill your internal workforce with tailored, instructor-led corporate bootcamps. Our practical, hands-on curriculum transforms operations and business teams into confident, data-fluent leaders.",
            features: [
                "Custom corporate training modules (Excel, SQL, Power BI, Statistics)",
                "Hands-on practice using your organization's internal datasets",
                "Post-training performance audits and continuous team mentorship",
                "Executive masterclasses on quantitative decision-making"
            ],
            badge: "Corporate Upskilling",
            ctaLink: "/contact",
            ctaText: "Book Corporate Training"
        }
    ];

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 1.25rem',
                    borderRadius: '999px',
                    backgroundColor: 'var(--accent-teal-subtle)',
                    color: 'var(--accent-teal-dark)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                    border: '1px solid var(--accent-teal-glow)'
                }}>
                    EdTech Ecosystem • Enterprise Data Engineering • Applied Mathematics
                </div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary-blue)', letterSpacing: '-0.02em' }}>
                    What We Build, Solve & Deliver
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '820px', margin: '0 auto', lineHeight: 1.7 }}>
                    From individual self-paced courses and live cohort bootcamps to enterprise data pipelines, analytics-ready web platforms, and applied mathematical modeling—we deliver end-to-end data intelligence for businesses and individuals alike.
                </p>
            </div>

            {/* Services Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2.5rem', marginBottom: '6rem' }}>
                {services.map((service, index) => (
                    <Card key={index} padding="lg" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '1.25rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '3.5rem',
                                height: '3.5rem',
                                backgroundColor: '#f1f5f9',
                                borderRadius: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {service.icon}
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.35rem 0.75rem',
                                borderRadius: '999px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#475569'
                            }}>
                                {service.badge}
                            </span>
                        </div>

                        <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary-blue)', lineHeight: 1.3 }}>
                            {service.title}
                        </h2>
                        <p style={{ marginBottom: '1.5rem', lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '0.975rem' }}>
                            {service.desc}
                        </p>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginBottom: '2rem', flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                Core Deliverables:
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {service.features.map((feature, i) => (
                                    <li key={i} style={{ marginBottom: '0.65rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        <CheckCircle2 size={16} color="var(--accent-teal)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <Link href={service.ctaLink || '/contact'} style={{ textDecoration: 'none' }}>
                                <Button variant="primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                    {service.ctaText || 'Learn More'} <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ))}
            </div>

            {/* How We Work / Process Section */}
            <div style={{ marginBottom: '6rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>Our Engagement Framework</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>A structured, transparent roadmap from discovery to deployment and adoption.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                    {[
                        { step: '01', title: 'Discovery & Data Audit', desc: 'We evaluate your business goals, mathematical formulation, current data pipelines, and intelligence gaps.' },
                        { step: '02', title: 'Mathematical & System Design', desc: 'We formulate quantitative models, simulate test scenarios, and architect extraction pipelines.' },
                        { step: '03', title: 'Engineering & Modeling', desc: 'We deploy automated data pipelines, build custom web interfaces, and configure executive dashboards.' },
                        { step: '04', title: 'Enablement & Education', desc: 'We provide comprehensive training for your team or individual cohort learners for permanent impact.' }
                    ].map((step, i) => (
                        <div key={i} style={{
                            padding: '2rem 1.5rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '1rem',
                            border: '1px solid #e2e8f0',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '3rem', height: '3rem',
                                backgroundColor: 'var(--primary-blue)',
                                color: 'white',
                                fontWeight: 800,
                                fontSize: '1.1rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.25rem'
                            }}>
                                {step.step}
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-blue)' }}>{step.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech & Math Tools Stack Band */}
            <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                marginBottom: '6rem'
            }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '1.5rem' }}>
                    Quantitative, Mathematical & Data Engineering Toolset
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem', justifyContent: 'center', alignItems: 'center', fontSize: '1.05rem', fontWeight: 600, color: '#334155' }}>
                    {['Mathematical Modeling', 'Monte Carlo Simulation', 'Python (NumPy, SciPy)', 'SQL & PostgreSQL', 'Next.js & React', 'Power BI & Tableau', 'ETL Pipelines', 'Optimization Algorithms', 'Advanced Microsoft Excel'].map(tool => (
                        <span key={tool} style={{
                            padding: '0.5rem 1.1rem',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '0.5rem',
                            color: '#1e293b'
                        }}>
                            {tool}
                        </span>
                    ))}
                </div>
            </div>

            {/* Direct Consultation & Academy CTA */}
            <div style={{
                backgroundColor: 'var(--primary-blue)',
                borderRadius: '1.5rem',
                padding: 'clamp(2.5rem, 5vw, 4rem) 1.5rem',
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', wordBreak: 'break-word' }}>
                    Ready to Transform Your Business or Accelerate Your Career?
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                    Whether you need enterprise mathematical modeling, custom data pipelines, or want to enroll in individual bootcamps and self-paced courses, Privailers is built to deliver.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/courses">
                        <Button variant="accent" size="lg" style={{ fontWeight: 700, padding: '0.85rem 2rem' }}>
                            Browse Courses & Bootcamps
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button variant="outline" size="lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                            Book a Corporate Consultation
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
