import Link from 'next/link';
import Button from '@/components/ui/Button';

const Navbar = () => {
    return (
        <nav style={{
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--white)',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '80px'
            }}>
                {/* Logo */}
                <Link href="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--primary-blue)',
                    letterSpacing: '-0.025em'
                }}>
                    Privailers<span style={{ color: 'var(--accent-teal)' }}>.</span>
                </Link>

                {/* Desktop Navigation */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link href="/about" style={{ fontWeight: 500, color: 'var(--foreground)' }}>About</Link>
                    <Link href="/services" style={{ fontWeight: 500, color: 'var(--foreground)' }}>Services</Link>
                    <Link href="/courses" style={{ fontWeight: 500, color: 'var(--foreground)' }}>Courses</Link>
                    <Link href="/contact" style={{ fontWeight: 500, color: 'var(--foreground)' }}>Contact</Link>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/student/login">
                        <Button variant="ghost" size="sm">Student Login</Button>
                    </Link>
                    <Link href="/contact">
                        <Button variant="primary" size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
