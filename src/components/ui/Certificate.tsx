"use client";

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Button from './Button';

interface CertificateProps {
    studentName: string;
    courseName: string;
    date: string;
    onClose: () => void;
}

export default function Certificate({ studentName, courseName, date, onClose }: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [template, setTemplate] = useState<1 | 2>(1);
    const [downloading, setDownloading] = useState(false);

    // Format date elegantly (e.g. "October 2026")
    const formattedDate = (() => {
        if (!date) return 'October 2026';
        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        return date;
    })();

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        setDownloading(true);

        try {
            // Scale 3 renders 3072 x 2046 px ultra-sharp print resolution
            const canvas = await html2canvas(certificateRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png', 1.0);

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            const safeName = (studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
            const safeCourse = (courseName || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
            pdf.save(`Privailers_${safeCourse}_Certificate_${safeName}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to generate certificate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    // Responsive font scaling for student name
    const nameFontSize = (() => {
        const len = (studentName || '').length;
        if (len > 35) return '1.65rem';
        if (len > 26) return '1.95rem';
        if (len > 20) return '2.25rem';
        return '2.45rem';
    })();

    // Responsive font scaling for course title
    const courseFontSize = (() => {
        const len = (courseName || '').length;
        if (len > 45) return '1.05rem';
        if (len > 32) return '1.18rem';
        return '1.3rem';
    })();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(6, 30, 72, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
            overflowY: 'auto'
        }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Lora:ital,wght@0,500;0,600;1,400&family=Poppins:wght@700;800&display=swap');
                    .cert-preview-scroll::-webkit-scrollbar {
                        height: 6px;
                    }
                    .cert-preview-scroll::-webkit-scrollbar-thumb {
                        background-color: rgba(6, 30, 72, 0.25);
                        border-radius: 10px;
                    }
                `}
            </style>

            <div style={{
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                borderRadius: '1.25rem',
                maxWidth: '1120px',
                width: '100%',
                maxHeight: '94vh',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                boxShadow: '0 25px 50px -12px rgba(6, 30, 72, 0.5)',
                boxSizing: 'border-box'
            }}>
                {/* Header Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '1rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-blue)', margin: 0 }}>
                            Official Certificate of Completion
                        </h2>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                            Issued by Privailers Data Consult • Verified Credential
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* Design Switcher */}
                        <div style={{
                            display: 'inline-flex',
                            backgroundColor: '#f1f5f9',
                            padding: '0.25rem',
                            borderRadius: '0.5rem',
                            gap: '0.25rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => setTemplate(1)}
                                style={{
                                    padding: '0.45rem 0.85rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: template === 1 ? 'var(--primary-blue)' : 'transparent',
                                    color: template === 1 ? '#ffffff' : '#64748b'
                                }}
                            >
                                Design 1 (Centered Logo)
                            </button>
                            <button
                                type="button"
                                onClick={() => setTemplate(2)}
                                style={{
                                    padding: '0.45rem 0.85rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    backgroundColor: template === 2 ? 'var(--primary-blue)' : 'transparent',
                                    color: template === 2 ? '#ffffff' : '#64748b'
                                }}
                            >
                                Design 2 (Corner Logo)
                            </button>
                        </div>

                        <Button variant="outline" size="sm" onClick={onClose} style={{ fontWeight: 600 }}>
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            disabled={downloading}
                            onClick={handleDownload}
                            style={{
                                backgroundColor: 'var(--accent-teal)',
                                borderColor: 'var(--accent-teal)',
                                color: '#ffffff',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: '0 4px 10px rgba(0, 168, 156, 0.25)'
                            }}
                        >
                            {downloading ? 'Generating PDF...' : '📥 Download High-Res PDF'}
                        </Button>
                    </div>
                </div>

                {/* Certificate Wrapper for Scrolling on small screens */}
                <div className="cert-preview-scroll" style={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#061e4810',
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0'
                }}>
                    {/* Fixed 1024x682 exact render canvas */}
                    <div
                        ref={certificateRef}
                        style={{
                            width: '1024px',
                            height: '682px',
                            minWidth: '1024px',
                            minHeight: '682px',
                            position: 'relative',
                            backgroundColor: '#ffffff',
                            overflow: 'hidden',
                            boxShadow: '0 12px 30px rgba(6, 30, 72, 0.2)',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Background Template Graphic */}
                        <img
                            src={template === 1 ? '/images/certificate-template-1.png' : '/images/certificate-template-2.png'}
                            alt="Privailers Certificate Template"
                            crossOrigin="anonymous"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '1024px',
                                height: '682px',
                                display: 'block',
                                objectFit: 'fill',
                                pointerEvents: 'none'
                            }}
                        />

                        {/* --- DYNAMIC CERTIFICATE CONTENT OVERLAY --- */}

                        {/* 1. Dynamic Student Name */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                top: template === 1 ? '324px' : '296px',
                                width: '780px',
                                textAlign: 'center',
                                fontFamily: "'Cinzel', 'Playfair Display', 'Times New Roman', Georgia, serif",
                                fontSize: nameFontSize,
                                fontWeight: 900,
                                color: '#061e48',
                                letterSpacing: '2px',
                                textTransform: 'uppercase',
                                lineHeight: 1.1,
                                zIndex: 10,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {studentName || 'Student Name'}
                        </div>

                        {/* 2. Dynamic Course Title */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                top: template === 1 ? '418px' : '397px',
                                width: '680px',
                                textAlign: 'center',
                                fontFamily: "var(--font-heading), 'Poppins', 'Montserrat', Arial, sans-serif",
                                fontSize: courseFontSize,
                                fontWeight: 800,
                                color: '#061e48',
                                letterSpacing: '0.4px',
                                lineHeight: 1.25,
                                zIndex: 10
                            }}
                        >
                            {courseName || 'Advanced Data Analysis Course'}
                        </div>

                        {/* 3. Dynamic Date */}
                        <div
                            style={{
                                position: 'absolute',
                                left: '232px',
                                transform: 'translateX(-50%)',
                                top: '556px',
                                width: '160px',
                                textAlign: 'center',
                                fontFamily: "'Lora', 'Georgia', serif",
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#061e48',
                                letterSpacing: '0.5px',
                                zIndex: 10
                            }}
                        >
                            {formattedDate}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: '#64748b',
                    paddingTop: '0.25rem'
                }}>
                    <span>Tip: Switch between Design 1 (Centered Crest) and Design 2 (Corner Crest) to choose your layout.</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-teal-dark)' }}>Verified Digital Certificate</span>
                </div>
            </div>
        </div>
    );
}
