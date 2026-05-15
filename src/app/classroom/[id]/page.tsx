"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VirtualClassroomPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data, error } = await supabase
                .from('cohort_classes')
                .select(`
                    *,
                    cohort:cohorts(name, instructor_id, instructor:users(full_name))
                `)
                .eq('id', id)
                .single();

            if (error || !data) {
                alert("Class not found or access denied.");
                router.back();
                return;
            }

            // Fetch user profile to get the correct role
            const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
            const userRole = profile?.role || 'student';

            if (data.status === 'completed') {
                alert("This session has already ended.");
                router.push(userRole === 'instructor' ? '/instructor/cohorts' : '/student/live-classes');
                return;
            }

            setClassData(data);
            setLoading(false);
        };

        checkAuthAndFetch();
    }, [id, router]);

    useEffect(() => {
        if (!user) return;

        // Realtime subscription to kick out students if session ends
        const channel = supabase
            .channel(`class_status_${id}`)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'cohort_classes',
                filter: `id=eq.${id}`
            }, async (payload) => {
                if (payload.new.status === 'completed') {
                    // Fetch fresh profile to check role
                    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
                    
                    if (profile?.role === 'student') {
                        alert("The instructor has ended the session. Thank you for attending!");
                        router.push('/student/live-classes');
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, user, router]);

    const handleEndSession = async () => {
        if (!confirm("Are you sure you want to end this session for everyone?")) return;
        
        const { error } = await supabase
            .from('cohort_classes')
            .update({ status: 'completed' })
            .eq('id', id);

        if (error) {
            alert("Error ending session: " + error.message);
        } else {
            alert("Session ended. Redirecting...");
            router.push('/instructor/cohorts');
        }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #334155', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                <p>Initializing Secure Classroom...</p>
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    // Dynamic Room Name based on Class ID and Title for security
    const roomName = `Privailers_${classData.cohort.name.replace(/\s+/g, '_')}_${classData.title.replace(/\s+/g, '_')}_${id}`;

    return (
        <div style={{ height: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Classroom Header */}
            <header style={{ padding: '1rem 2rem', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div>
                    <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{classData.title}</h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Cohort: {classData.cohort.name} • Instructor: {classData.cohort.instructor?.full_name}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {user?.id === classData.cohort?.instructor_id && (
                        <button 
                            onClick={handleEndSession}
                            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#1e293b', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 700, cursor: 'pointer' }}
                        >
                            End Session for Everyone
                        </button>
                    )}
                    <button 
                        onClick={() => router.back()}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Leave Classroom
                    </button>
                </div>
            </header>

            {/* Video Meeting Container */}
            <div style={{ flex: 1, position: 'relative' }}>
                <iframe 
                    allow="camera; microphone; display-capture; fullscreen; clipboard-read; clipboard-write; speaker"
                    src={`https://meet.jit.si/${roomName}#userInfo.displayName="${user.user_metadata?.full_name || 'Student'}"&config.startWithAudioMuted=true&config.prejoinPageEnabled=false`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />
            </div>
            
            {/* Branding Watermark */}
            <div style={{ position: 'absolute', bottom: '2rem', right: '2rem', pointerEvents: 'none', opacity: 0.5 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                    Privailers<span style={{ color: '#6366f1' }}>Portal</span>
                </div>
            </div>
        </div>
    );
}
