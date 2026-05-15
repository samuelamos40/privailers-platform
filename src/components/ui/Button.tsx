import React, { ButtonHTMLAttributes } from 'react';
// Actually, let's use the global utility classes we defined in globals.css or inline styles for simplicity 
// given we are not using css modules yet, but creating a resilient component is better.
// I'll stick to the global classes I added in globals.css for now to keep it simple as requested "Vanilla CSS".

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'accent' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    // Map variants to CSS classes
    const variantClass = {
        primary: 'btn-primary',
        accent: 'btn-accent',
        outline: 'btn-outline', // I need to add this to globals.css if not there, or handle it here
        ghost: 'btn-ghost'
    }[variant];

    // size mapping
    const sizeStyles = {
        sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
    }[size];

    return (
        <button
            className={`btn ${variantClass} ${className}`}
            style={{ ...sizeStyles }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
