import React from 'react';

const ModuleList = () => {
    const modules = [
        { id: 1, title: 'Introduction to Data Analysis', completed: true },
        { id: 2, title: 'Understanding Data Types', completed: true },
        { id: 3, title: 'Spreadsheet Basics', completed: true },
        { id: 4, title: 'Formulas and Functions', completed: false, current: true },
        { id: 5, title: 'Data Visualization Intro', completed: false },
        { id: 6, title: 'SQL Fundamentals', completed: false },
    ];

    return (
        <div style={{ backgroundColor: 'var(--white)', borderRight: '1px solid var(--border-color)', height: '100%', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>Course Modules</h3>
            <ul style={{ listStyle: 'none' }}>
                {modules.map(module => (
                    <li key={module.id} style={{ marginBottom: '0.75rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            backgroundColor: module.current ? 'rgba(0, 184, 212, 0.1)' : 'transparent',
                            color: module.current ? 'var(--accent-teal-dark)' : 'var(--foreground)',
                            cursor: 'pointer',
                            fontWeight: module.current ? 600 : 400
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: `2px solid ${module.completed ? 'var(--accent-teal)' : '#ddd'}`,
                                backgroundColor: module.completed ? 'var(--accent-teal)' : 'transparent',
                                marginRight: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {module.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <span style={{ fontSize: '0.95rem' }}>{module.title}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ModuleList;
