"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({
    children,
    requireRole,
}: {
    children: React.ReactNode;
    requireRole?: 'student' | 'admin' | 'instructor' | ('student' | 'admin' | 'instructor')[];
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not authenticated, redirect to login
                if (requireRole === 'admin') {
                    router.push('/admin-login');
                } else {
                    router.push('/login');
                }
            } else if (requireRole) {
                const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
                
                const userRole = (user.role || '').toLowerCase().trim();
                const hasAccess = allowedRoles.some(r => r.toLowerCase().trim() === userRole) || 
                                 userRole === 'admin' || 
                                 (allowedRoles.includes('student') && userRole === 'instructor');

                if (!hasAccess) {
                    console.error(`Access Denied: User role '${userRole}' is not in allowed roles: [${allowedRoles.join(',')}]`);
                    router.push('/');
                }
            }
        }
    }, [user, loading, router]); // Removed requireRole from deps to prevent infinite loops if passed as inline array

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-blue)' }}>Loading...</div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    if (requireRole) {
        const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
        const userRole = (user.role || '').toLowerCase().trim();
        const hasAccess = allowedRoles.some(r => r.toLowerCase().trim() === userRole) || 
                         userRole === 'admin' || 
                         (allowedRoles.includes('student') && userRole === 'instructor');
        
        if (!hasAccess) {
            return null;
        }
    }

    return <>{children}</>;
}
