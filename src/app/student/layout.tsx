"use client";

import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { platformName, announcementText, showAnnouncement, maintenanceMode: maintenance } = useAppSettings();

    if (maintenance) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛠️</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Under Maintenance</h1>
                <p style={{ color: '#64748b', marginTop: '1rem', maxWidth: '400px' }}>
                    We are currently upgrading the platform to serve you better. Please check back shortly.
                </p>
            </div>
        );
    }

    return (
        <ProtectedRoute requireRole="student">
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                <div className="mobile-topbar" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src="/images/logo.png" alt="Logo" style={{ height: '35px', width: 'auto' }} />
                    </div>
                    <button 
                         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                         style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        ☰
                    </button>
                </div>
                {/* Backdrop for mobile */}
                {isMobileMenuOpen && (
                    <div 
                         style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 45, backdropFilter: 'blur(2px)' }} 
                         onClick={() => setIsMobileMenuOpen(false)} 
                    />
                )}
                <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                <main className="main-content">
                    {showAnnouncement && announcementText && (
                        <div style={{
                            backgroundColor: '#fff7ed',
                            borderBottom: '1px solid #fed7aa',
                            color: '#c2410c',
                            padding: '0.75rem 2rem',
                            textAlign: 'center',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>📢</span> {announcementText}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
