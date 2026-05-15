"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

export default function AdminResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Dataset',
        fileUrl: '',
        fileSize: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (data) setResources(data);
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setUploading(true);

        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        const sizeStr = `${sizeMb} MB`;

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "privailers_upload");
        // 'auto' detects PDF, ZIP, IMG etc.
        data.append("resource_type", "auto");

        try {
            const res = await fetch("https://api.cloudinary.com/v1_1/dnymde4mn/auto/upload", {
                method: "POST",
                body: data
            });
            const json = await res.json();

            if (json.secure_url) {
                setFormData(prev => ({
                    ...prev,
                    fileUrl: json.secure_url,
                    fileSize: sizeStr,
                    title: prev.title || file.name
                }));
            } else {
                throw new Error(json.error?.message || "Upload failed");
            }
        } catch (error: any) {
            alert("Error uploading: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fileUrl) return alert("Please upload a file first.");

        const { error } = await supabase.from('resources').insert([{
            title: formData.title,
            category: formData.category,
            file_url: formData.fileUrl,
            file_size: formData.fileSize
        }]);

        if (!error) {
            alert("Resource added!");
            setIsFormOpen(false);
            setFormData({ title: '', category: 'Dataset', fileUrl: '', fileSize: '' });
            fetchResources();
        } else {
            alert("Error: " + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this resource?")) return;
        const { error } = await supabase.from('resources').delete().eq('id', id);
        if (!error) fetchResources();
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>← Back to Dashboard</Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Resource Library</h1>
                <Button variant="primary" onClick={() => setIsFormOpen(true)}>+ Add Resource</Button>
            </div>

            {isFormOpen && (
                <Card style={{ marginBottom: '2rem', maxWidth: '600px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Add New Resource</h3>
                    <form onSubmit={handleSave}>
                        <Input label="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Category</label>
                            <select
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Dataset</option>
                                <option>Guide</option>
                                <option>Template</option>
                                <option>Software</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>File Upload</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <label style={{
                                    backgroundColor: uploading ? '#e2e8f0' : '#f1f5f9',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    cursor: uploading ? 'wait' : 'pointer',
                                    border: '1px solid #cbd5e1'
                                }}>
                                    {uploading ? 'Uploading...' : 'Choose File'}
                                    <input type="file" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                                </label>
                                {formData.fileUrl && <span style={{ color: '#059669', fontSize: '0.875rem' }}>✓ Ready: {formData.fileSize}</span>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button type="submit" variant="primary">Save Resource</Button>
                            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {resources.length === 0 && !loading && <div style={{ color: '#64748b' }}>No resources found.</div>}
                {resources.map((res) => (
                    <Card key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
                                backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '0.75rem'
                            }}>{res.category}</span>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{res.title}</span>
                            <span style={{ color: '#94a3b8', marginLeft: '1rem', fontSize: '0.875rem' }}>{res.file_size}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href={res.file_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">Download</Button>
                            </a>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(res.id)} style={{ color: '#ef4444' }}>Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
