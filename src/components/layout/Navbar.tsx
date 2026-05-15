"use client";

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
    const { user, signOut, isAdmin, isStudent } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const dashboardLink = isAdmin ? '/admin' : isStudent ? '/student' : '/instructor';

    return (
        <nav style={{
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--white)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <style jsx>{`
                .mobile-menu-btn { display: none; }
                @media (max-width: 900px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: block !important;
                    }
                }
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '80px',
                padding: '0 1rem'
            }}>
                {/* Logo */}
                <div style={{ flex: '1 0 200px' }}>
                    <Link href="/" style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <img src="/images/logo.png" alt="Privailers Data Consult" style={{ height: '60px', width: 'auto' }} />
                    </Link>
                </div>

                {/* Desktop Navigation - Centered */}
                <div className="desktop-nav" style={{ 
                    display: 'flex', 
                    gap: '2.5rem', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '2'
                }}>
                    <Link href="/" style={{ fontWeight: 500, color: 'var(--foreground)', transition: 'color 0.2s' }}>Home</Link>
                    <Link href="/about" style={{ fontWeight: 500, color: 'var(--foreground)', transition: 'color 0.2s' }}>About</Link>
                    <Link href="/services" style={{ fontWeight: 500, color: 'var(--foreground)' }}>Services</Link>
                    <Link href="/courses" style={{ fontWeight: 500, color: 'var(--foreground)' }}>Courses</Link>
                    <Link href="/contact" style={{ fontWeight: 500, color: 'var(--foreground)' }}>Contact</Link>
                </div>

                {/* CTA - Right Aligned */}
                <div className="desktop-nav" style={{ 
                    display: 'flex', 
                    gap: '1.25rem', 
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flex: '1 0 200px'
                }}>
                    {user ? (
                        <>
                            <Link href={dashboardLink}>
                                <Button variant="ghost" size="sm" style={{ fontWeight: 600 }}>Dashboard</Button>
                            </Link>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                style={{ fontWeight: 600, padding: '0.6rem 1.25rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                onClick={async () => {
                                    await signOut();
                                    window.location.href = '/';
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" style={{ fontWeight: 600 }}>Student Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary" size="sm" style={{ fontWeight: 600, padding: '0.6rem 1.25rem' }}>Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: 'var(--foreground)', padding: '0.5rem' }}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isMobileMenuOpen && (
                <div className="mobile-dropdown" style={{ 
                    backgroundColor: 'white', 
                    borderBottom: '1px solid #e2e8f0', 
                    position: 'absolute', 
                    top: '80px', 
                    left: 0, 
                    right: 0, 
                    zIndex: 40, 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--foreground)' }}>Home</Link>
                        <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--foreground)' }}>About</Link>
                        <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--foreground)' }}>Services</Link>
                        <Link href="/courses" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--foreground)' }}>Courses</Link>
                        <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--foreground)', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>Contact</Link>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexDirection: 'column' }}>
                            {user ? (
                                <>
                                    <Link href={dashboardLink} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" style={{ width: '100%', justifyContent: 'center', height: '50px' }}>Dashboard</Button>
                                    </Link>
                                    <Button 
                                        variant="primary" 
                                        style={{ width: '100%', justifyContent: 'center', height: '50px', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                        onClick={async () => {
                                            await signOut();
                                            window.location.href = '/';
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="ghost" style={{ width: '100%', justifyContent: 'center', height: '50px' }}>Student Login</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button variant="primary" style={{ width: '100%', justifyContent: 'center', height: '50px' }}>Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

