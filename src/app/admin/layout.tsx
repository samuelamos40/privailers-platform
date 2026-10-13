"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { platformName } = useAppSettings();

    return (
        <ProtectedRoute requireRole="admin">
            <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
                <div className="mobile-topbar admin">
                    <div suppressHydrationWarning style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{platformName} Admin</div>
                    <button 
                         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                         className="mobile-menu-btn"
                         style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white', padding: '0.5rem' }}
                         aria-label="Open menu"
                    >
                        ☰
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div 
                         style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 55, backdropFilter: 'blur(3px)' }} 
                         onClick={() => setIsMobileMenuOpen(false)} 
                    />
                )}
                <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                <main className="main-content admin">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
