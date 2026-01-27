import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md'
}) => {

    const paddingStyles = {
        none: '0',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem'
    }[padding];

    return (
        <div
            className={`card ${className}`}
            style={{
                backgroundColor: 'var(--white)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid var(--border-color)',
                padding: paddingStyles,
                overflow: 'hidden'
            }}
        >
            {children}
        </div>
    );
};

export default Card;
