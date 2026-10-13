"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLiveRoom({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const resolvedParams = use(params);
    const classId = resolvedParams.id;
    const [classData, setClassData] = useState<any>(null);

    useEffect(() => {
        const fetchClass = async () => {
            const { data } = await supabase.from('live_classes').select('*').eq('id', classId).single();
            if (data) setClassData(data);
        };
        fetchClass();
    }, [classId]);

    if (!classData) return <div style={{ padding: '2rem', color: 'white', backgroundColor: '#0f172a', height: '100vh' }}>Loading studio...</div>;

    const isExternal = classData.meeting_url && classData.meeting_url !== 'internal_platform_room' && classData.meeting_url.startsWith('http');
    const jitsiRoomName = `Privailers_Class_Room_${classId.replace(/-/g, '')}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a' }}>
            <div style={{ padding: '1rem 2rem', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ color: 'white', margin: 0, fontSize: '1.25rem' }}>🔴 {classData.title} <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>(Admin Host View)</span></h1>
                </div>
                <Link href="/admin/live-classes" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 600, padding: '0.5rem 1rem', border: '1px solid #ef4444', borderRadius: '0.5rem' }}>
                    Leave Studio
                </Link>
            </div>
            <div style={{ flex: 1, backgroundColor: 'black' }}>
                {isExternal ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem' }}>🎥</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Host External Video Session</h2>
                        <p style={{ maxWidth: '500px', color: '#94a3b8', lineHeight: 1.6 }}>
                            This class is configured with an external meeting link (e.g. Google Meet or Zoom). Click below to launch the host session in a new tab.
                        </p>
                        <a 
                            href={classData.meeting_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                padding: '0.85rem 2rem', 
                                backgroundColor: '#ef4444', 
                                color: 'white', 
                                borderRadius: '0.5rem', 
                                textDecoration: 'none', 
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                            }}
                        >
                            Start / Join Meeting Link →
                        </a>
                    </div>
                ) : (
                    <iframe
                        allow="camera; microphone; display-capture; fullscreen"
                        src={`https://meet.ffrn.de/${jitsiRoomName}#userInfo.displayName="${encodeURIComponent(user?.email || 'Admin')}"&config.startWithAudioMuted=false&config.prejoinPageEnabled=false`}
                        style={{ height: '100%', width: '100%', border: 0 }}
                    />
                )}
            </div>
        </div>
    );
}
