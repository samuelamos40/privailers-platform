"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';

const InstructorSidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
    const { signOut } = useAuth();
    const { platformName } = useAppSettings();
    const links = [
        { href: '/instructor', label: 'My Dashboard' },
        { href: '/instructor/courses', label: 'My Courses' },
        { href: '/instructor/live-classes', label: 'Live Sessions 📹' },
        { href: '/instructor/cohorts', label: 'Batches/Cohorts 👥' },
        { href: '/instructor/assignments', label: 'Grading & Assignments' },
        { href: '/courses', label: 'Public Catalog 🎓' },
        { href: '/', label: 'Logout' },
    ];

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('privailers_logging_out', 'true');
        }
        await signOut();
        window.location.href = '/';
    };

    return (
        <aside className={`sidebar-nav admin ${isOpen ? 'open' : ''}`}>
            <div style={{ marginBottom: '3rem', fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                <span suppressHydrationWarning>{platformName} Instructor</span>
                {onClose && (
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}
                        className="mobile-close-btn"
                    >
                        ✕
                    </button>
                )}
            </div>
            <nav>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {links.map(link => {
                        const isLogout = link.label === 'Logout';
                        return (
                            <li key={link.href} style={{ marginBottom: '1rem' }}>
                                <Link
                                    href={link.href}
                                    onClick={isLogout ? handleLogout : undefined}
                                    style={{
                                        display: 'block',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        color: isLogout ? '#ef4444' : 'rgba(255,255,255,0.7)',
                                        textDecoration: 'none',
                                        transition: 'background 0.2s, color 0.2s',
                                        fontWeight: isLogout ? 600 : 400
                                    }}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
};

export default InstructorSidebar;
