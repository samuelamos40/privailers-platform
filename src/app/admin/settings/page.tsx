"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

const InputGroup = ({ label, description, children }: any) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
            {label}
        </label>
        {description && <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>{description}</p>}
        {children}
    </div>
);

const SettingsCard = ({ title, children }: any) => (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid #e2e8f0', height: '100%' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
            {title}
        </h2>
        {children}
    </div>
);

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        // General
        platform_name: 'Privailers.',
        // Contact
        whatsapp_number: '',
        support_email: '',
        instagram_url: '',
        twitter_url: '',
        // System
        maintenance_mode: 'false',
        allow_registrations: 'true',
        announcement_text: '',
        show_announcement: 'false',
        // Payment
        bank_details: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('app_settings').select('*');
        if (data) {
            const newSettings: any = { ...settings };
            data.forEach((item: any) => {
                if (Object.keys(newSettings).includes(item.key)) {
                    newSettings[item.key] = item.value;
                }
            });
            setSettings(newSettings);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const updates = Object.entries(settings).map(([key, value]) => ({
            key,
            value,
            updated_at: new Date().toISOString()
        }));

        const { error } = await supabase.from('app_settings').upsert(updates);

        if (error) {
            setMessage({ type: 'error', text: 'Failed to update settings: ' + error.message });
        } else {
            setMessage({ type: 'success', text: 'Settings saved successfully' });
            // Optional: Trigger a re-fetch or context update if we had a global settings context
        }
        setSaving(false);
    };

    // Components extracted above to prevent re-render focus loss

    if (loading) return <div style={{ padding: '2rem' }}>Loading configuration...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>Platform Settings</h1>
                    <p style={{ color: '#64748b' }}>Control global configurations for the student portal.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            {message && (
                <div style={{
                    padding: '1rem', marginBottom: '2rem', borderRadius: '0.5rem',
                    backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>

                {/* 1. General & Branding */}
                <SettingsCard title="🔹 General & Branding">
                    <InputGroup label="Platform Name" description="Displayed in the sidebar and browser title.">
                        <input type="text" value={settings.platform_name} onChange={e => setSettings({ ...settings, platform_name: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                    </InputGroup>
                    <InputGroup label="Bank Transfer Instructions" description="Shown to students when they choose Manual Bank Transfer.">
                        <textarea rows={4} value={settings.bank_details} onChange={e => setSettings({ ...settings, bank_details: e.target.value })}
                            placeholder="Bank Name: \nAccount Number: \nAccount Name:"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                    </InputGroup>
                </SettingsCard>

                {/* 2. Communication */}
                <SettingsCard title="📞 Contact & Socials">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <InputGroup label="WhatsApp Number">
                            <input type="text" value={settings.whatsapp_number} onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                        </InputGroup>
                        <InputGroup label="Support Email">
                            <input type="email" value={settings.support_email} onChange={e => setSettings({ ...settings, support_email: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                        </InputGroup>
                    </div>
                    <InputGroup label="Instagram URL">
                        <input type="text" value={settings.instagram_url} onChange={e => setSettings({ ...settings, instagram_url: e.target.value })}
                            placeholder="https://instagram.com/..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                    </InputGroup>
                    <InputGroup label="Twitter / X URL">
                        <input type="text" value={settings.twitter_url} onChange={e => setSettings({ ...settings, twitter_url: e.target.value })}
                            placeholder="https://twitter.com/..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                    </InputGroup>
                </SettingsCard>

                {/* 3. System Control */}
                <SettingsCard title="⚙️ System Controls">
                    <InputGroup label="Maintenance Mode" description="If enabled, students will see a maintenance screen. Admins still have access.">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={settings.maintenance_mode === 'true'} onChange={e => setSettings({ ...settings, maintenance_mode: String(e.target.checked) })}
                                style={{ width: '1.25rem', height: '1.25rem' }} />
                            <span style={{ color: settings.maintenance_mode === 'true' ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                                {settings.maintenance_mode === 'true' ? '🔴 Maintenance Mode ACTIVE' : 'Status: Operational'}
                            </span>
                        </label>
                    </InputGroup>

                    <InputGroup label="Global Announcement" description="Vital messages shown at the top of the dashboard.">
                        <textarea rows={2} value={settings.announcement_text} onChange={e => setSettings({ ...settings, announcement_text: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={settings.show_announcement === 'true'} onChange={e => setSettings({ ...settings, show_announcement: String(e.target.checked) })} />
                            <span style={{ fontSize: '0.875rem' }}>Show Banner</span>
                        </label>
                    </InputGroup>
                </SettingsCard>

            </form>
        </div>
    );
}
