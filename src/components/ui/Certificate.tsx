import React, { useRef } from 'react';
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

    const handleDownload = async () => {
        if (!certificateRef.current) return;
        
        try {
            // Scale 3 provides ultra-high resolution suitable for printing
            const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Failed to generate certificate PDF.");
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '2rem'
        }}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Great+Vibes&family=Lora:ital,wght@0,400;0,700;1,400&display=swap');
                `}
            </style>
            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', maxWidth: '1100px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                
                {/* Header Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>Certificate Preview</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                        <Button variant="primary" onClick={handleDownload} style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none' }}>
                            Download High-Res PDF
                        </Button>
                    </div>
                </div>

                {/* Certificate Wrapper for Scrolling */}
                <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center', backgroundColor: '#e2e8f0', padding: '2rem', borderRadius: '0.5rem' }}>
                    
                    {/* Inner Render Box */}
                    <div ref={certificateRef} style={{
                        width: '960px',
                        height: '680px',
                        backgroundColor: '#fffff8', // Delicate Parchment white
                        padding: '40px',
                        boxSizing: 'border-box',
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        
                        {/* Geometric Background Subtle Pattern */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'radial-gradient(circle, rgba(255,255,255,0) 30%, rgba(212,175,55,0.08) 100%)',
                            pointerEvents: 'none'
                        }}></div>

                        {/* Outer Blue Double Border */}
                        <div style={{ 
                            border: '12px double #0284c7',
                            height: '100%',
                            padding: '10px',
                            boxSizing: 'border-box',
                            position: 'relative'
                        }}>
                            {/* Inner Gold Fine Border */}
                            <div style={{
                                border: '2px solid #d4af37',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '40px 60px',
                                boxSizing: 'border-box',
                                position: 'relative',
                                zIndex: 10
                            }}>
                                
                                {/* Company Header & Logo/Badge */}
                                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', fontWeight: 900, color: '#0284c7', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                        Privailers Data Academy
                                    </div>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#d4af37">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                    </svg>
                                </div>

                                <div style={{ fontFamily: "'Cinzel', serif", color: '#0f172a', fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '6px', textAlign: 'center' }}>
                                    Certificate of Completion
                                </div>
                                <div style={{ fontFamily: "'Lora', serif", color: '#0284c7', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '2.5rem', fontWeight: 700 }}>
                                    Awarded for Excellence & Dedication
                                </div>
                                
                                <div style={{ fontFamily: "'Lora', serif", fontSize: '1.25rem', marginBottom: '1.5rem', fontStyle: 'italic', color: '#475569' }}>
                                    This confirms that
                                </div>
                                
                                {/* Dynamic Script Name */}
                                <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: '4.5rem', color: '#0f172a', marginBottom: '2rem', lineHeight: 1, borderBottom: '2px solid #e2e8f0', padding: '0 2rem' }}>
                                    {studentName}
                                </div>
                                
                                <div style={{ fontFamily: "'Lora', serif", fontSize: '1.1rem', marginBottom: '1rem', color: '#475569' }}>
                                    has successfully satisfied the requirements for the program:
                                </div>
                                
                                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: 'auto', textAlign: 'center', maxWidth: '80%' }}>
                                    {courseName}
                                </div>
                                
                                {/* Signatures and Date Footer */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '3rem', alignItems: 'flex-end', padding: '0 2rem' }}>
                                    
                                    {/* Date Section */}
                                    <div style={{ textAlign: 'center', width: '200px' }}>
                                        <div style={{ fontFamily: "'Lora', serif", fontSize: '1.2rem', color: '#0f172a', borderBottom: '1px solid #94a3b8', paddingBottom: '5px', marginBottom: '5px' }}>
                                            {date}
                                        </div>
                                        <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Date Issued
                                        </div>
                                    </div>

                                    {/* Company Blue/Gold Seal Graphic */}
                                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', border: '6px solid #d4af37' }}>
                                        <div style={{ width: '65px', height: '65px', borderRadius: '50%', border: '2px dashed #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontFamily: "'Cinzel', serif", color: 'white', fontWeight: 900, fontSize: '1.8rem', letterSpacing: '1px' }}>PA</span>
                                        </div>
                                    </div>

                                    {/* Signature Section */}
                                    <div style={{ textAlign: 'center', width: '200px' }}>
                                        <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', color: '#0f172a', borderBottom: '1px solid #94a3b8', paddingBottom: '0', marginBottom: '5px', lineHeight: 0.8 }}>
                                            Privailers Admin
                                        </div>
                                        <div style={{ fontFamily: "'Lora', serif", fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Lead Instructor
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
