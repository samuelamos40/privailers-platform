"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';

const AdminSidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
    const { signOut } = useAuth();
    const { platformName } = useAppSettings();
    const links = [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/courses', label: 'Manage Courses' },
        { href: '/admin/live-classes', label: 'Live Classes 📹' },
        { href: '/admin/cohorts', label: 'Batches/Cohorts 👥' },
        { href: '/admin/assignments', label: 'Assignments' },
        { href: '/admin/students', label: 'Students' },
        { href: '/admin/instructors', label: 'Instructors 🧑‍🏫' },
        { href: '/admin/leads', label: 'Lead CRM' },
        { href: '/admin/subscribers', label: 'Newsletter 📧' },
        { href: '/admin/coupons', label: 'Promo Coupons 🎟️' },
        { href: '/admin/ambassadors', label: 'Ambassadors 🤝' },
        { href: '/admin/referrals', label: 'Referrals 💰' },
        { href: '/admin/settings', label: 'Settings' },
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
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div suppressHydrationWarning style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {platformName}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Admin Portal
                    </div>
                </div>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="mobile-close-btn"
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            padding: 0,
                            width: '36px',
                            height: '36px',
                            minWidth: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            zIndex: 10
                        }}
                        aria-label="Close menu"
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
                            <li key={link.href} style={{ marginBottom: '0.4rem' }}>
                                <Link
                                    href={link.href}
                                    onClick={(e) => {
                                        if (isLogout) {
                                            handleLogout(e);
                                        } else {
                                            if (onClose) onClose();
                                        }
                                    }}
                                    style={{
                                        display: 'block',
                                        padding: '0.65rem 0.875rem',
                                        borderRadius: '0.5rem',
                                        color: isLogout ? '#ef4444' : 'rgba(255,255,255,0.75)',
                                        textDecoration: 'none',
                                        transition: 'background 0.2s, color 0.2s',
                                        fontWeight: isLogout ? 600 : 400,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.925rem'
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

export default AdminSidebar;
