"use client";

import InstructorSidebar from "@/components/layout/InstructorSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Allowing both admin and instructor roles to view instructor dashboard (so admins can oversee everything)
    return (
        <ProtectedRoute requireRole={['instructor', 'admin']}>
            <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
                <div className="mobile-topbar admin">
                    <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>Privailers Instructor</div>
                    <button 
                         onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                         style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'white', padding: '0.5rem' }}
                    >
                        ☰
                    </button>
                </div>
                {isMobileMenuOpen && (
                    <div 
                         style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 45 }} 
                         onClick={() => setIsMobileMenuOpen(false)} 
                    />
                )}
                <InstructorSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                <main className="main-content admin">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
