"use client";

import { useAppSettings } from '@/hooks/useAppSettings';

export default function WhatsAppFloat() {
    const { whatsappNumber } = useAppSettings();
    const rawNum = (whatsappNumber && whatsappNumber !== '2348000000000')
        ? whatsappNumber.replace(/\D/g, '')
        : '2347078865107';

    const message = encodeURIComponent(
        "Hello Privailers Data Consult! I would like to inquire about your courses or corporate consulting services."
    );
    const whatsappUrl = `https://wa.me/${rawNum}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#25D366',
                color: '#ffffff',
                padding: '0.75rem 1.15rem',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: '0 10px 25px -5px rgba(37, 211, 102, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
        >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.625.846 5.059 2.284 7.033l-1.494 5.462 5.605-1.469c1.911 1.239 4.183 1.974 6.605 1.974 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
            </svg>
            <span>Chat on WhatsApp</span>
        </a>
    );
}
