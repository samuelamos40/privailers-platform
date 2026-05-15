"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/supabase';

    type AuthContextType = {
        user: User | null;
        loading: boolean;
        signIn: (email: string, password: string) => Promise<User | null>;
        signOut: () => Promise<void>;
        isAdmin: boolean;
        isStudent: boolean;
        isAccountActive: boolean;
        isExpired: boolean;
    };

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export function AuthProvider({ children }: { children: React.ReactNode }) {
        const [user, setUser] = useState<User | null>(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            // Check active session
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    fetchUserData(session.user.id);
                } else {
                    setLoading(false);
                }
            });

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    fetchUserData(session.user.id);
                } else {
                    setUser(null);
                    setLoading(false);
                }
            });

            return () => subscription.unsubscribe();
        }, []);

        const fetchUserData = async (userId: string) => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (data && !error) {
                    setUser(data);
                } else {
                    console.warn("User profile not found in public.users table.");
                    setUser(null); // Explicitly null if not found
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const signIn = async (email: string, password: string): Promise<User | null> => {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (authData?.user) {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();
                    
                if (data) {
                    setUser(data);
                    return data;
                }
            }
            return null;
        };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
    };

    const isExpired = user?.access_expires_at ? new Date(user.access_expires_at) < new Date() : false;
    const isAccountActive = user?.access_status === 'active' && !isExpired;

    const value = {
        user,
        loading,
        signIn,
        signOut,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isAccountActive,
        isExpired,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
