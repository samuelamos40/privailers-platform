import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Privailers Data Consult",
    description: "Terms of Service governing Privailers Data Consult's EdTech Academy and Enterprise Consulting services.",
};

export default function TermsOfServicePage() {
    return (
        <div className="container" style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 1.25rem', lineHeight: 1.75, color: '#334155' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                Terms of Service
            </h1>
            <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                Effective Date: January 1, 2026 • Last Updated: November 2026
            </p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
                <p>
                    By accessing <strong>privailers.com</strong>, enrolling in our Academy programs, or engaging Privailers Data Consult for enterprise data engineering, analytics, or mathematical modeling services, you agree to be bound by these Terms of Service.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>2. Academy Accounts &amp; Course License</h2>
                <p>
                    When you enroll in a self-paced course or live cohort bootcamp, you are granted a personal, non-transferable license to access the curriculum materials, datasets, and video sessions. Account sharing, unauthorized redistribution, or commercial resale of Privailers course content is strictly prohibited.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>3. Certificates of Completion</h2>
                <p>
                    Verified digital certificates are awarded to students who complete the required modules, practical projects, and assessments. Certificates carry a unique verification reference issued by Privailers Data Consult.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>4. Corporate Consulting Engagements</h2>
                <p>
                    Enterprise deliverables—including automated ETL pipelines, BI dashboards, custom web platforms, and quantitative mathematical models—are governed by individual Statements of Work (SOW) agreed upon with each corporate client.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>5. Support &amp; Inquiries</h2>
                <p>
                    For questions regarding these terms, please contact us at <a href="mailto:info@privailers.com" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>info@privailers.com</a>.
                </p>
            </section>
        </div>
    );
}
