"use client";

import { useState, useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

export default function RichTextEditor({ value, onChange, placeholder, style }: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const applyFormat = (prefix: string, suffix: string = prefix) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        const before = value.substring(0, start);
        const after = value.substring(end);

        const newValue = before + prefix + selectedText + suffix + after;
        onChange(newValue);

        // Restore cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const toolbarButtons = [
        { label: 'B', title: 'Bold', action: () => applyFormat('<strong>', '</strong>') },
        { label: 'I', title: 'Italic', action: () => applyFormat('<em>', '</em>') },
        { label: 'U', title: 'Underline', action: () => applyFormat('<u>', '</u>') },
        { label: '• List', title: 'Bullet List', action: () => applyFormat('<ul>\n<li>', '</li>\n</ul>') },
        { label: '1. List', title: 'Numbered List', action: () => applyFormat('<ol>\n<li>', '</li>\n</ol>') },
        { label: '🔗', title: 'Link', action: () => {
            const url = prompt('Enter URL:');
            if (url) applyFormat(`<a href="${url}" target="_blank">`, '</a>');
        }},
        { label: 'H2', title: 'Heading', action: () => applyFormat('<h2>', '</h2>') },
    ];

    return (
        <div className="rich-text-wrapper" style={{ ...style }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex',
                gap: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#f8fafc',
                borderTopLeftRadius: '0.5rem',
                borderTopRightRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                borderBottom: 'none',
                flexWrap: 'wrap'
            }}>
                {toolbarButtons.map((btn, i) => (
                    <button
                        key={i}
                        type="button"
                        title={btn.title}
                        onClick={btn.action}
                        style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: btn.label === 'B' ? 700 : btn.label === 'I' ? 400 : 500,
                            fontStyle: btn.label === 'I' ? 'italic' : 'normal',
                            textDecoration: btn.label === 'U' ? 'underline' : 'none',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.25rem',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            color: '#334155',
                            transition: 'all 0.15s',
                            lineHeight: 1.4
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = '#e2e8f0'; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'white'; }}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'Write your content here...'}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                    width: '100%',
                    minHeight: '180px',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    border: `1px solid ${isFocused ? '#3b82f6' : '#cbd5e1'}`,
                    borderBottomLeftRadius: '0.5rem',
                    borderBottomRightRadius: '0.5rem',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                    color: '#1e293b',
                    backgroundColor: 'white'
                }}
            />
        </div>
    );
}
