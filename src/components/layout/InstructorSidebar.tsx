import Link from 'next/link';

const InstructorSidebar = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
    const links = [
        { href: '/instructor', label: 'My Dashboard' },
        { href: '/instructor/courses', label: 'My Courses' },
        { href: '/instructor/live-classes', label: 'Live Sessions 📹' },
        { href: '/instructor/cohorts', label: 'Batches/Cohorts 👥' },
        { href: '/instructor/assignments', label: 'Grading & Assignments' },
        { href: '/courses', label: 'Public Catalog 🎓' },
        { href: '/', label: 'Logout' },
    ];

    return (
        <aside className={`sidebar-nav admin ${isOpen ? 'open' : ''}`}>
            <div style={{ marginBottom: '3rem', fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                <span>Instructor Portal</span>
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
                    {links.map(link => (
                        <li key={link.href} style={{ marginBottom: '1rem' }}>
                            <Link
                                href={link.href}
                                style={{
                                    display: 'block',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    color: 'rgba(255,255,255,0.7)',
                                    textDecoration: 'none',
                                    transition: 'background 0.2s, color 0.2s'
                                }}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default InstructorSidebar;
