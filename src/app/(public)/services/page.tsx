import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import type { Metadata } from "next";
import { Database, Globe2, BarChart3, GraduationCap, ArrowRight, CheckCircle2, Calculator, BookOpen, BrainCircuit } from "lucide-react";

export const metadata: Metadata = {
    title: "Consulting & Engineering Services - Privailers Data Consult",
    description: "Cloud data pipelines, data science, machine learning, business intelligence, mathematical modeling, analytics-ready web development, corporate training, and EdTech academy.",
};

export default function ServicesPage() {
    const services = [
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
            icon: <BrainCircuit size={28} color="#6366f1" />,
            title: "Data Science & Machine Learning Solutions",
            desc: "Harness the power of machine learning and statistical modeling to anticipate customer behavior, optimize operations, and unlock predictive capabilities. From classification algorithms to demand forecasting, we turn historical data into forward-looking intelligence.",
            features: [
                "Predictive modeling, customer churn & lifetime value (LTV) forecasting",
                "Supervised & unsupervised machine learning models (Python, Scikit-Learn)",
                "Natural Language Processing (NLP) & recommendation engines",
                "Production model deployment, REST API integration & continuous monitoring"
            ],
            badge: "Predictive AI & Data Science",
            ctaLink: "/contact",
            ctaText: "Inquire About Data Science"
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
        },
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
        }
    ];

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
                <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary-blue)', letterSpacing: '-0.02em' }}>
                    What We Build, Solve & Deliver
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '820px', margin: '0 auto', lineHeight: 1.7 }}>
                    From enterprise cloud data pipelines, machine learning models, and executive dashboards to applied mathematical modeling, corporate upskilling, and individual bootcamps—we deliver end-to-end data intelligence.
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
                                color: 'var(--primary-blue)'
                            }}>
                                {service.badge}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                            {service.title}
                        </h3>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.975rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                            {service.desc}
                        </p>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700, marginBottom: '1rem' }}>
                                Capabilities & Deliverables
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {service.features.map((feat, fIndex) => (
                                    <li key={fIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#475569' }}>
                                        <CheckCircle2 size={16} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Link href={service.ctaLink} style={{ textDecoration: 'none', marginTop: 'auto' }}>
                            <Button
                                variant={service.badge === "Individual Learning" ? "accent" : "primary"}
                                style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                                {service.ctaText} <ArrowRight size={16} />
                            </Button>
                        </Link>
                    </Card>
                ))}
            </div>

            {/* Bottom Proof Section */}
            <div style={{
                backgroundColor: 'var(--primary-blue)',
                borderRadius: '1.5rem',
                padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem' }}>
                        Ready to Build Scalable Data Solutions?
                    </h2>
                    <p style={{ color: '#cbd5e1', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Whether you are an enterprise seeking custom data engineering or an organization upskilling your workforce—Privailers is your strategic technical partner.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/contact">
                            <Button variant="accent" size="lg" style={{ fontWeight: 700 }}>Schedule Consultation</Button>
                        </Link>
                        <Link href="/courses">
                            <Button variant="outline" size="lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Explore Academy</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
