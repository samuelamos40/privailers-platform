import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Accordion from "@/components/ui/Accordion";
import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us - Privailers Data Consult",
    description: "Get in touch with our team for consultancy inquiries or course enrollment.",
};

export default function ContactPage() {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--primary-blue)', wordBreak: 'break-word' }}>Let's Start a Conversation</h1>
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                    Whether you're looking to transform your business with data or launch your career, we're here to help.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '3rem', marginBottom: '6rem' }}>
                {/* Contact Info */}
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--primary-blue)' }}>Contact Information</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--accent-teal-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)', flexShrink: 0 }}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Phone</h3>
                                <p style={{ color: 'var(--text-muted)' }}>+234 707 886 5107</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Mon-Fri from 9am to 6pm</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--accent-teal-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)', flexShrink: 0 }}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Email</h3>
                                <p style={{ color: 'var(--text-muted)' }}>privailerdataconsult@gmail.com</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>For general inquiries and support</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div style={{ width: '3rem', height: '3rem', backgroundColor: 'var(--accent-teal-subtle)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)', flexShrink: 0 }}>
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--foreground)' }}>Office</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Operating Remotely</p>
                                <p style={{ color: 'var(--text-muted)' }}>Global Access</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--foreground)' }}>Connect With Us</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {['LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map(social => (
                                <div key={social} style={{
                                    padding: '0.5rem 1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '2rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: 'var(--primary-blue)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>
                                    {social}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card padding="lg">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Send a Message</h2>
                    <ContactForm />
                </Card>
            </div>

            {/* FAQs */}
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>
                        Frequently Asked Questions
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        Everything you need to know about our data consulting services, bootcamps, and platform.
                    </p>
                </div>
                <Accordion items={[
                    {
                        title: "What services does Privailers Data Consult provide for businesses?",
                        content: "We provide end-to-end quantitative and data solutions: applied mathematical modeling, stochastic simulations, Monte Carlo analysis, automated ETL/ELT data pipelines, analytics-ready web platforms with custom data extraction, executive Business Intelligence dashboards (Power BI & Tableau), and tailored corporate training."
                    },
                    {
                        title: "Can I buy self-paced courses and enroll in individual training?",
                        content: "Yes! Through our integrated EdTech marketplace, individuals can purchase self-paced video courses with lifetime access and practical project work. We also conduct intensive live cohort bootcamps and 1-on-1 individual training paths with resume audits and direct job placement support."
                    },
                    {
                        title: "What mathematical modeling and simulation capabilities do you offer?",
                        content: "Our quantitative team formulates real-world challenges using deterministic and stochastic mathematical models, Monte Carlo simulations, numerical optimization, risk modeling, and operations research algorithms to help organizations make high-stakes decisions with mathematical precision."
                    },
                    {
                        title: "Can you build custom data pipelines and web data extraction systems for our company?",
                        content: "Yes. We engineer automated pipelines and data extraction tools that systematically collect, clean, validate, and synchronize data from APIs, internal databases, custom web platforms, and spreadsheets into unified data warehouses for reliable, real-time reporting."
                    },
                    {
                        title: "Do you offer corporate training tailored to specific team workflows?",
                        content: "Yes. We conduct bespoke corporate training in Microsoft Excel, SQL, and Power BI tailored directly to your company's operational reporting needs. We offer flexible scheduling, live interactive sessions, and post-training competency assessments."
                    },
                    {
                        title: "Where are you located and how do you work with clients?",
                        content: "We operate remotely with global reach, serving clients and students across Nigeria, Africa, and internationally. We also have active expansion plans for a physical Privailers Innovation Hub in Ado-Ekiti to further anchor hands-on tech and quantitative talent development."
                    },
                    {
                        title: "How do payments and enrollments work on the platform?",
                        content: "All course purchases and bootcamp registrations are processed securely through Paystack. You can pay with debit/credit cards, bank transfers, or USSD. Once payment is confirmed, your course access or cohort seat is unlocked instantly on your student dashboard."
                    }
                ]} />
            </div>
        </div>
    );
}
