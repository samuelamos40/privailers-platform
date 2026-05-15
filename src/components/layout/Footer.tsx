"use client";

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [socials, setSocials] = useState({ twitter: '#', instagram: '#', facebook: '#' });

    // Fetch social links from database on load
    useState(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('app_settings')
                .select('key, value')
                .in('key', ['twitter_url', 'instagram_url', 'facebook_url']);

            if (data) {
                const tw = data.find(s => s.key === 'twitter_url');
                const ig = data.find(s => s.key === 'instagram_url');
                const fb = data.find(s => s.key === 'facebook_url');
                setSocials({
                    twitter: tw?.value || '#',
                    instagram: ig?.value || '#',
                    facebook: fb?.value || '#'
                });
            }
        };
        fetchSettings();
    });

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        setStatus('loading');
        setMessage('');
        try {
            const { error: insertError } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email: trimmedEmail }]);

            if (insertError) {
                if (insertError.code === '23505') {
                    setMessage('You are already subscribed!');
                    setStatus('success');
                } else {
                    throw insertError;
                }
            } else {
                setMessage('Successfully subscribed! Thank you.');
                setEmail('');
                setStatus('success');
            }
        } catch (err: any) {
            console.error('Newsletter error details:', err);
            const errMsg = err.message || (typeof err === 'string' ? err : 'Database error');
            
            if (errMsg.includes('relation "newsletter_subscribers" does not exist')) {
                setMessage('Database error: Newsletter table not found. Please run the SQL schema.');
            } else {
                setMessage(errMsg);
            }
            setStatus('error');
        }
    };

    return (
        <footer style={{
            backgroundColor: 'var(--primary-blue)',
            color: 'var(--white)',
            padding: '5rem 0 2rem',
            borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '4rem',
                    marginBottom: '4rem'
                }}>
                    {/* Brand & Socials */}
                    <div>
                        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/images/logo.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                                Privailers Data Consult
                            </h3>
                        </div>
                        <p style={{ opacity: 0.9, fontWeight: 500, lineHeight: 1.7, marginBottom: '2rem', maxWidth: '320px', color: '#cbd5e1' }}>
                            Empowering Insights. Driving Growth.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            {[
                                { name: 'LinkedIn', url: '#', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
                                { name: 'Facebook', url: socials.facebook, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z"/></svg> },
                                { name: 'Twitter', url: socials.twitter, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg> },
                                { name: 'Instagram', url: socials.instagram, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                            ].map(platform => (
                                <a key={platform.name} href={platform.url} target={platform.url !== '#' ? '_blank' : undefined} rel={platform.url !== '#' ? 'noopener noreferrer' : undefined} style={{ 
                                    width: '40px', height: '40px', borderRadius: '50%', 
                                    backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', 
                                    alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                                    color: 'white'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-teal)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                >
                                    {platform.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-teal)', display: 'inline-block', paddingBottom: '0.25rem' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li><Link href="/about" style={{ opacity: 0.8, transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'}>About Us</Link></li>
                            <li><Link href="/services" style={{ opacity: 0.8 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'}>Consultancy Services</Link></li>
                            <li><Link href="/courses" style={{ opacity: 0.8 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'}>Training Courses</Link></li>
                            <li><Link href="/contact" style={{ opacity: 0.8 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'}>Contact</Link></li>
                            <li><Link href="/admin-login" style={{ opacity: 0.8 }} onMouseOver={(e) => e.currentTarget.style.opacity = '1'}>Admin Access</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-teal)', display: 'inline-block', paddingBottom: '0.25rem' }}>Newsletter</h4>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Stay updated with the latest data trends and course launches.</p>
                        <form style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }} onSubmit={handleSubscribe}>
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email || ''}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ 
                                    padding: '0.75rem 1rem', 
                                    borderRadius: '0.5rem', 
                                    border: 'none', 
                                    flex: 1,
                                    fontSize: '0.875rem',
                                    color: '#0f172a'
                                }} 
                            />
                            <button 
                                type="submit"
                                disabled={status === 'loading'}
                                style={{ 
                                    padding: '0.75rem 1.25rem', 
                                    backgroundColor: status === 'success' ? '#10b981' : 'var(--accent-teal)', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '0.5rem', 
                                    fontWeight: 600,
                                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                    opacity: status === 'loading' ? 0.7 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Join'}
                            </button>
                        </form>
                        {message && (
                            <p style={{ 
                                fontSize: '0.8rem', 
                                color: status === 'error' ? '#fda4af' : '#6ee7b7',
                                fontWeight: 500,
                                animation: 'fadeIn 0.3s ease-out'
                            }}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '2.5rem',
                    textAlign: 'center',
                    opacity: 0.6,
                    fontSize: '0.875rem',
                    letterSpacing: '0.025em'
                }}>
                    &copy; {new Date().getFullYear()} Privailers Data Consult. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;

