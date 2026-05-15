import React from "react";
import Card from "./Card";

interface TeamMemberCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    role: string;
    bio: string;
    imageUrl?: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
    name,
    role,
    bio,
    imageUrl,
    style,
    ...props
}) => {
    return (
        <Card
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
                ...style
            }}
            {...props}
        >
            <div style={{
                height: '240px',
                backgroundColor: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8'
            }}>
                {imageUrl ? (
                    <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <svg width="64" height="64" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                )}
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-blue)', marginBottom: '0.25rem' }}>{name}</h3>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-teal-dark)', marginBottom: '1rem' }}>{role}</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{bio}</p>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                    {/* Social placeholders */}
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', cursor: 'pointer' }}>in</div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', cursor: 'pointer' }}>x</div>
                </div>
            </div>
        </Card>
    );
};

export default TeamMemberCard;
