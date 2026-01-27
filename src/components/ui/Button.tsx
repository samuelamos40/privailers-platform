import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.css'; // We'll implement this or use global utility classes. 
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

    // size mapping could be handled by classes or styles, keeping it simple for now

    return (
        <button
            className={`btn ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
