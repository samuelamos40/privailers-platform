"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tier: 'free',
        duration: '',
        price: '0'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase
            .from('courses')
            .insert([{
                title: formData.title,
                description: formData.description,
                tier: formData.tier,
                duration: formData.duration,
                price: parseFloat(formData.price) || 0
            }])
            .select()
            .single();

        if (error) {
            alert('Error creating course: ' + error.message);
            setLoading(false);
        } else {
            // Redirect to the editor for this new course
            router.push(`/admin/courses/${data.id}`);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin/courses" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    ← Back to Courses
                </Link>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginTop: '0.5rem', color: '#1e293b' }}>
                    Create New Course
                </h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Course Title"
                        placeholder="e.g. Advanced Excel Mastery"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>
                            Description
                        </label>
                        <textarea
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #cbd5e1',
                                minHeight: '100px',
                                fontFamily: 'inherit'
                            }}
                            placeholder="What will students learn?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#475569' }}>
                                Tier
                            </label>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #cbd5e1',
                                    fontFamily: 'inherit',
                                    backgroundColor: 'white'
                                }}
                                value={formData.tier}
                                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                            >
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                        <Input
                            label="Duration"
                            placeholder="e.g. 4 weeks"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                        />
                    </div>

                    {formData.tier === 'paid' && (
                        <Input
                            label="Price (NGN)"
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    )}

                    <div style={{ marginTop: '2rem' }}>
                        <Button type="submit" variant="primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Course'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
