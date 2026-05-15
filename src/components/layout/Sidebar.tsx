"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
    const { signOut } = useAuth();
    const [whatsappNumber, setWhatsappNumber] = useState('2348000000000');
    const [platformName, setPlatformName] = useState('Privailers.');

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('key, value')
                .in('key', ['whatsapp_number', 'platform_name']);

            if (data) {
                const wa = data.find(s => s.key === 'whatsapp_number');
                const name = data.find(s => s.key === 'platform_name');
                if (wa?.value) setWhatsappNumber(wa.value);
                if (name?.value) setPlatformName(name.value);
            }
        };
        fetchSettings();
    }, []);

    const links = [
        { href: '/student', label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg> },
        { href: '/student/courses', label: 'My Courses', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg> },
        { href: '/student/live-classes', label: 'Live Classes', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"></path><rect x="2" y="6" width="14" height="12" rx="2" ry="2"></rect></svg> },
        { href: '/student/projects', label: 'Projects', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> },
        { href: '/student/resources', label: 'Resources', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
        { href: '/', label: 'Logout', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> },
    ];

    return (
        <aside className={`sidebar-nav ${isOpen ? 'open' : ''}`}>
            <div style={{ marginBottom: '3rem', padding: '0 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/student" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <img src="/images/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
                </Link>
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="mobile-close-btn"
                        style={{ display: 'none', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        ✕
                    </button>
                )}
            </div>

            <nav>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {links.map(link => {
                        const isLogout = link.label === 'Logout';
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    onClick={async (e) => {
                                        if (isLogout) {
                                            e.preventDefault();
                                            await signOut();
                                            window.location.href = '/';
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '0.75rem',
                                        color: isLogout ? '#ef4444' : '#475569',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        fontWeight: 500,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = isLogout ? '#fef2f2' : '#f1f5f9';
                                        if (!isLogout) e.currentTarget.style.color = 'var(--primary-blue)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = isLogout ? '#ef4444' : '#475569';
                                    }}
                                >
                                    <span style={{ fontSize: '1.25rem' }}>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div style={{
                marginTop: 'auto',
                position: 'absolute',
                bottom: '2rem',
                left: '1.5rem',
                right: '1.5rem',
                padding: '1.5rem',
                backgroundColor: '#f0fdf4',
                borderRadius: '1rem',
                border: '1px solid #dcfce7',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.75rem', fontWeight: 600 }}>Need Help?</div>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    padding: '0.75rem',
                    borderRadius: '0.75rem',
                    backgroundColor: '#16a34a', // WhatsApp Green
                    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)',
                    transition: 'transform 0.1s'
                }}>
                    <span>💬</span> Chat Support
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;
