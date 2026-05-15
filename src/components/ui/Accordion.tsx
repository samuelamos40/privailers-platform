"use client";

import React, { useState } from "react";

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onClick?: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick }) => {
    return (
        <div style={{ borderBottom: '1px solid var(--border-color)' }}>
            <button
                onClick={onClick}
                style={{
                    width: '100%',
                    padding: '1.5rem 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    outline: 'none',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: isOpen ? 'var(--primary-blue)' : 'var(--text-color)'
                }}
            >
                {title}
                <span style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    color: 'var(--accent-teal-dark)'
                }}>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
            </button>
            <div style={{
                maxHeight: isOpen ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-out',
                opacity: isOpen ? 1 : 0.5
            }}>
                <div style={{ paddingBottom: '1.5rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

interface AccordionProps {
    items: { title: string; content: React.ReactNode }[];
}

const Accordion: React.FC<AccordionProps> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div style={{ borderTop: '1px solid var(--border-color)' }}>
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    isOpen={openIndex === index}
                    onClick={() => toggleItem(index)}
                >
                    {item.content}
                </AccordionItem>
            ))}
        </div>
    );
};

export default Accordion;
