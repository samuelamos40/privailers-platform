import Link from 'next/link';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: 'var(--primary-blue)',
            color: 'var(--white)',
            padding: '4rem 0 2rem'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    {/* Brand */}
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Privailers<span style={{ color: 'var(--accent-teal)' }}>.</span>
                        </h3>
                        <p style={{ opacity: 0.8, lineHeight: 1.6, maxWidth: '300px' }}>
                            Empowering businesses with data-driven insights and cultivating the next generation of data professionals.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link href="/about" style={{ opacity: 0.8 }}>About Us</Link></li>
                            <li><Link href="/services" style={{ opacity: 0.8 }}>Consultancy Services</Link></li>
                            <li><Link href="/courses" style={{ opacity: 0.8 }}>Training Courses</Link></li>
                            <li><Link href="/resources" style={{ opacity: 0.8 }}>Resources</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Contact</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li style={{ opacity: 0.8 }}>info@privailers.com</li>
                            <li style={{ opacity: 0.8 }}>+1 (555) 123-4567</li>
                            <li style={{ opacity: 0.8 }}>Lagos, Nigeria</li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    opacity: 0.6,
                    fontSize: '0.875rem'
                }}>
                    &copy; {new Date().getFullYear()} Privailers Data Consult. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
