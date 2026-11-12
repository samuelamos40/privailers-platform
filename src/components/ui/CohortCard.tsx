import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Calendar, Users, GraduationCap, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export interface CohortItem {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    capacity: number;
    price?: number | null;
    status: 'open' | 'active' | 'completed' | 'cancelled' | string;
    instructor?: { full_name?: string } | { full_name?: string }[] | any;
    enrolled_count?: number;
}

interface CohortCardProps {
    cohort: CohortItem;
    compact?: boolean;
}

export function getCohortStage(cohort: CohortItem) {
    const today = new Date().toISOString().split('T')[0];
    const startDate = cohort.start_date;
    const endDate = cohort.end_date;
    const isCapacityFull = cohort.capacity && cohort.enrolled_count && cohort.enrolled_count >= cohort.capacity;

    if (cohort.status === 'completed' || (endDate && today > endDate)) {
        return {
            stage: 'ended' as const,
            badgeText: 'COHORT ENDED',
            badgeBg: '#e2e8f0',
            badgeColor: '#475569',
            badgeBorder: '#cbd5e1',
            statusDesc: 'This cohort has successfully concluded.',
            canRegister: false,
            buttonText: 'Completed (Next Batch Soon)',
            actionUrl: '#',
        };
    }

    if (
        cohort.status === 'active' ||
        cohort.status === 'closed' ||
        isCapacityFull ||
        (startDate && today >= startDate && (!endDate || today <= endDate))
    ) {
        return {
            stage: 'live' as const,
            badgeText: '🔴 COHORT IS LIVE (Registration Closed)',
            badgeBg: '#fef2f2',
            badgeColor: '#b91c1c',
            badgeBorder: '#fecaca',
            statusDesc: 'Classes are currently in session. Registration for this batch is closed.',
            canRegister: false,
            buttonText: 'Registration Closed • Cohort Live',
            actionUrl: '#',
        };
    }

    // Default: Registration is Open
    return {
        stage: 'open' as const,
        badgeText: '🟢 REGISTRATION OPEN',
        badgeBg: '#dcfce7',
        badgeColor: '#15803d',
        badgeBorder: '#86efac',
        statusDesc: `Classes start on ${formatDate(cohort.start_date)}. Seats are filling fast!`,
        canRegister: true,
        buttonText: Number(cohort.price || 0) > 0 ? `Register (₦${Number(cohort.price).toLocaleString()}) →` : 'Register Now (Free) →',
        actionUrl: `/register?intent=cohort&cohortId=${cohort.id}`,
    };
}

function formatDate(dateStr: string) {
    if (!dateStr) return 'TBA';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export default function CohortCard({ cohort, compact = false }: CohortCardProps) {
    const stageInfo = getCohortStage(cohort);
    const isFree = !cohort.price || Number(cohort.price) === 0;
    const instructorName = Array.isArray(cohort.instructor) 
        ? cohort.instructor[0]?.full_name 
        : cohort.instructor?.full_name;

    return (
        <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1.25rem',
            border: stageInfo.stage === 'open' ? '2px solid var(--accent-teal)' : '1px solid #e2e8f0',
            boxShadow: stageInfo.stage === 'open' ? '0 10px 25px -5px rgba(0, 168, 156, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            height: '100%'
        }}>
            {/* Top Status Header */}
            <div style={{
                padding: '1.25rem 1.5rem',
                background: stageInfo.stage === 'open' 
                    ? 'linear-gradient(135deg, #0a2e6b 0%, #061e48 100%)' 
                    : stageInfo.stage === 'live' 
                    ? 'linear-gradient(135deg, #450a0a 0%, #1e1b4b 100%)'
                    : '#f1f5f9',
                color: stageInfo.stage === 'ended' ? '#475569' : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.3rem 0.65rem',
                        borderRadius: '999px',
                        backgroundColor: stageInfo.badgeBg,
                        color: stageInfo.badgeColor,
                        border: `1px solid ${stageInfo.badgeBorder}`,
                        letterSpacing: '0.04em'
                    }}>
                        {stageInfo.badgeText}
                    </span>
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        backgroundColor: isFree ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isFree ? '#86efac' : '#fcd34d'
                    }}>
                        {isFree ? '100% FREE' : `₦${Number(cohort.price).toLocaleString()}`}
                    </span>
                </div>

                <h3 style={{
                    fontSize: compact ? '1.2rem' : '1.35rem',
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1.25,
                    color: stageInfo.stage === 'ended' ? '#0f172a' : '#ffffff'
                }}>
                    {cohort.name}
                </h3>
            </div>

            {/* Body Info */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {stageInfo.statusDesc}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
                        <span><strong>Class Schedule:</strong> {formatDate(cohort.start_date)} — {formatDate(cohort.end_date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
                        <span><strong>Capacity:</strong> {cohort.capacity ? `${cohort.capacity} students max` : 'Limited'}</span>
                    </div>
                    {instructorName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <GraduationCap size={16} color="var(--accent-teal)" style={{ flexShrink: 0 }} />
                            <span><strong>Instructor:</strong> {instructorName}</span>
                        </div>
                    )}
                </div>

                {/* Bottom Action Area */}
                <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {stageInfo.canRegister ? (
                        <Link href={stageInfo.actionUrl} style={{ textDecoration: 'none' }}>
                            <Button variant="accent" style={{ width: '100%', justifyContent: 'center', fontWeight: 700, padding: '0.85rem' }}>
                                {stageInfo.buttonText}
                            </Button>
                        </Link>
                    ) : (
                        <div style={{
                            padding: '0.85rem',
                            borderRadius: '0.5rem',
                            backgroundColor: stageInfo.stage === 'live' ? '#fef2f2' : '#f1f5f9',
                            color: stageInfo.stage === 'live' ? '#991b1b' : '#64748b',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}>
                            {stageInfo.buttonText}
                        </div>
                    )}

                    {stageInfo.stage !== 'open' && (
                        <a
                            href={`https://wa.me/2347078865107?text=Hello%2C%20I%20missed%20the%20${encodeURIComponent(cohort.name)}%20batch.%20Please%20notify%20me%20for%20the%20next%20batch.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textAlign: 'center',
                                fontSize: '0.8rem',
                                color: '#0284c7',
                                textDecoration: 'none',
                                fontWeight: 600,
                                marginTop: '0.25rem'
                            }}
                        >
                            Join waitlist for next batch on WhatsApp →
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
