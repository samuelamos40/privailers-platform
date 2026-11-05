import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refund & Cancellation Policy - Privailers Data Consult",
    description: "Official refund, deferral, and cancellation policy for Privailers Data Consult courses and bootcamps.",
};

export default function RefundPolicyPage() {
    return (
        <div className="container" style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 1.25rem', lineHeight: 1.75, color: '#334155' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                Refund &amp; Cancellation Policy
            </h1>
            <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                Effective Date: January 1, 2026 • Last Updated: November 2026
            </p>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>1. Live Instructor-Led Cohort Bootcamps</h2>
                <p>
                    Students enrolled in live cohort bootcamps may request a full refund or a free batch deferral up to <strong>48 hours after the first live orientation session</strong>, provided less than 20% of course materials have been downloaded. Alternatively, students can transfer their enrollment to the next upcoming cohort batch at no extra cost.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>2. Self-Paced Digital Courses</h2>
                <p>
                    Self-paced courses include a <strong>7-day satisfaction guarantee</strong> from the date of purchase, provided less than 25% of the video curriculum has been completed and no completion certificate has been generated.
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>3. Duplicate Charges &amp; Technical Billing Errors</h2>
                <p>
                    In the event of an accidental duplicate transaction via Paystack, 100% of the duplicate payment will be refunded immediately upon verification of the payment reference.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.75rem' }}>4. How to Request a Refund or Deferral</h2>
                <p>
                    Send an email to <a href="mailto:info@privailers.com" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>info@privailers.com</a> with your registered email address and Paystack payment reference. Approved refunds are processed back to the original payment method within 5–7 business days.
                </p>
            </section>
        </div>
    );
}
