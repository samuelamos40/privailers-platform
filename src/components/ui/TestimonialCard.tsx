import React from "react";
import Card from "./Card";

interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    role: string;
    quote: string;
    avatarInitials?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
    name,
    role,
    quote,
    avatarInitials,
    style,
    ...props
}) => {
    return (
        <Card
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                ...style
            }}
            {...props}
        >
            <div style={{ marginBottom: '1.5rem' }}>
                {/* 5 Stars */}
                <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <p style={{ fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text-color)' }}>"{quote}"</p>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-blue)',
                    color: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '1.125rem'
                }}>
                    {avatarInitials || name.charAt(0)}
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>{name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{role}</div>
                </div>
            </div>
        </Card>
    );
};

export default TestimonialCard;
