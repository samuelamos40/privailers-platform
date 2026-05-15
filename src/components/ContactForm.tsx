"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        interest: 'Data Consultancy for Business',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        const { error: submitError } = await supabase
            .from('leads')
            .insert([{
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                company: formData.company || null,
                interest: formData.interest,
                message: formData.message,
                status: 'new'
            }]);

        if (submitError) {
            setError('Failed to submit form. Please try again.');
            setSubmitting(false);
        } else {
            setSubmitted(true);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                company: '',
                interest: 'Data Consultancy for Business',
                message: ''
            });
            setTimeout(() => setSubmitted(false), 5000);
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <Input
                    label="First Name"
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                />
                <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                />
            </div>
            <Input
                label="Email Address"
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
            />
            <Input
                label="Company (Optional)"
                placeholder="Your Company Name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--primary-blue)' }}>
                    I am interested in...
                </label>
                <select
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        backgroundColor: 'var(--background)'
                    }}
                    required
                >
                    <option>Data Consultancy for Business</option>
                    <option>Join the Academy (Student)</option>
                    <option>Partnership Opportunities</option>
                    <option>Other</option>
                </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--primary-blue)' }}>
                    Message
                </label>
                <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        minHeight: '150px',
                        resize: 'vertical',
                        backgroundColor: 'var(--background)'
                    }}
                    placeholder="Tell us about your needs..."
                    required
                />
            </div>

            {error && (
                <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {submitted && (
                <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Thank you! We'll get back to you soon.
                </div>
            )}

            <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                style={{ width: '100%', justifyContent: 'center' }}
            >
                {submitting ? 'Sending...' : 'Send Message'}
            </Button>
        </form>
    );
}
