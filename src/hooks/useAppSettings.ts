"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface AppSettings {
    platformName: string;
    whatsappNumber: string;
    supportEmail: string;
    instagramUrl: string;
    twitterUrl: string;
    facebookUrl: string;
    linkedinUrl: string;
    maintenanceMode: boolean;
    announcementText: string;
    showAnnouncement: boolean;
    bankDetails: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    platformName: 'Privailers',
    whatsappNumber: '2348000000000',
    supportEmail: 'support@privailers.com',
    instagramUrl: '#',
    twitterUrl: '#',
    facebookUrl: '#',
    linkedinUrl: '#',
    maintenanceMode: false,
    announcementText: '',
    showAnnouncement: false,
    bankDetails: ''
};

const STORAGE_KEY = 'privailers_app_settings';

export function useAppSettings() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const loadSettings = useCallback(async () => {
        // Read client-side cached settings after mount
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(STORAGE_KEY);
                if (cached) {
                    setSettings(prev => ({ ...prev, ...JSON.parse(cached) }));
                }
            } catch (e) {}
        }
        try {
            const { data, error } = await supabase.from('app_settings').select('*');
            if (data && !error) {
                const map: Record<string, string> = {};
                data.forEach((item: any) => {
                    map[item.key] = item.value;
                });

                const updated: AppSettings = {
                    platformName: map['platform_name'] || DEFAULT_SETTINGS.platformName,
                    whatsappNumber: map['whatsapp_number'] || DEFAULT_SETTINGS.whatsappNumber,
                    supportEmail: map['support_email'] || DEFAULT_SETTINGS.supportEmail,
                    instagramUrl: map['instagram_url'] || DEFAULT_SETTINGS.instagramUrl,
                    twitterUrl: map['twitter_url'] || DEFAULT_SETTINGS.twitterUrl,
                    facebookUrl: map['facebook_url'] || DEFAULT_SETTINGS.facebookUrl,
                    linkedinUrl: map['linkedin_url'] || DEFAULT_SETTINGS.linkedinUrl,
                    maintenanceMode: map['maintenance_mode'] === 'true',
                    announcementText: map['announcement_text'] || DEFAULT_SETTINGS.announcementText,
                    showAnnouncement: map['show_announcement'] === 'true',
                    bankDetails: map['bank_details'] || DEFAULT_SETTINGS.bankDetails
                };

                setSettings(updated);
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                } catch (e) {}
            }
        } catch (err) {
            console.error('Error loading app settings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();

        const handleUpdate = () => {
            try {
                const cached = localStorage.getItem(STORAGE_KEY);
                if (cached) {
                    setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(cached) });
                }
            } catch (e) {}
            loadSettings();
        };

        window.addEventListener('app_settings_updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('app_settings_updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [loadSettings]);

    return {
        ...settings,
        loading,
        refreshSettings: loadSettings
    };
}
