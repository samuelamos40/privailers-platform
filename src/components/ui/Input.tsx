import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
    const inputId = id || props.name;

    return (
        <div className="input-group" style={{ marginBottom: '1rem', width: '100%' }}>
            {label && (
                <label
                    htmlFor={inputId}
                    style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'var(--primary-blue)'
                    }}
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={className}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${error ? '#ef4444' : 'var(--border-color)'}`,
                    outline: 'none',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                    backgroundColor: 'var(--background)'
                }}
                {...props}
            />
            {error && (
                <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
