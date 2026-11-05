import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Privailers Data Consult",
    description: "Privacy Policy and data protection guidelines for Privailers Data Consult Ltd.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="container" style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 1.25rem', lineHeight: 1.75, color: '#334155' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                Privacy Policy
            </h1>
            <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                Effective Date: January 1, 2026 • Last Updated: November 2026
            </p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>1. Information We Collect</h2>
                <p>
                    Privailers Data Consult (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects personal information that you voluntarily provide when registering for a student account, enrolling in a course or cohort bootcamp, or requesting corporate consulting services. This includes your full name, email address, phone number, organization name, and course progress data.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>2. Payment Security</h2>
                <p>
                    All course and cohort payments are processed securely through <strong>Paystack</strong>. Privailers Data Consult does not store raw credit or debit card numbers on our servers. Payment verification references and transaction receipts are retained solely for accounting, enrollment activation, and customer support.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>3. How We Use Your Information</h2>
                <p>
                    We use collected data to provision classroom access, issue verifiable digital certificates, send automated transactional emails (such as payment receipts, live class reminders, and assignment notifications), and respond to corporate consulting inquiries.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>4. Data Confidentiality &amp; Third Parties</h2>
                <p>
                    We never sell or rent your personal data to third-party marketers. Client datasets shared during corporate consulting or mathematical modeling engagements are governed by strict non-disclosure and confidentiality standards.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>5. Contact Us</h2>
                <p>
                    To request data updates, account deletion, or privacy clarifications, contact our data protection team at <a href="mailto:info@privailers.com" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>info@privailers.com</a> or call <strong>+234 707 886 5107</strong>.
                </p>
            </section>
        </div>
    );
}
