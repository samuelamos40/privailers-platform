"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            const { data } = await supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setResources(data);
            setLoading(false);
        };
        fetchResources();
    }, []);

    // Helper to determine icon/color based on category
    const getCategoryStyle = (type: string) => {
        switch (type) {
            case 'Dataset': return { bg: 'rgba(0,184,212,0.1)', color: 'var(--accent-teal-dark)', label: 'Dataset' };
            case 'Guide': return { bg: '#fef3c7', color: '#f59e0b', label: 'Guide' };
            case 'Template': return { bg: '#e0e7ff', color: '#4338ca', label: 'Template' };
            default: return { bg: '#f1f5f9', color: '#64748b', label: type };
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading resources...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--primary-blue)' }}>Learning Resources</h1>

            {resources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    No resources added yet. Check back later!
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {resources.map((res, idx) => {
                        const style = getCategoryStyle(res.category);
                        return (
                            <Card key={idx} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600,
                                            color: style.color, backgroundColor: style.bg,
                                            padding: '0.25rem 0.5rem', borderRadius: '0.25rem'
                                        }}>
                                            {style.label}
                                        </span>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '0.75rem', marginBottom: '0.25rem' }}>
                                            {res.title}
                                        </h3>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            {res.file_size} • {new Date(res.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{
                                        width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b'
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    </div>
                                </div>
                                <a href={res.file_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    <Button variant="outline" size="sm" style={{ width: '100%', justifyContent: 'center' }}>Download Resource</Button>
                                </a>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
