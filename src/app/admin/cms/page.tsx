import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

export default function CMSPage() {
    return (
        <div style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Content Management System</h1>

            <Card padding="lg">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: '#1e293b' }}>Post New Content</h2>

                <form>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>Content Type</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="radio" name="type" defaultChecked /> Article
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="radio" name="type" /> Tip Snippet
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="radio" name="type" /> Announcement
                            </label>
                        </div>
                    </div>

                    <Input label="Title" placeholder="e.g., Top 5 SQL Tricks for Analysts" />

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#475569' }}>Body Content</label>
                        <textarea style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                        }} placeholder="Markdown supported..."></textarea>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <Input label="Cover Image URL" placeholder="https://..." />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button variant="ghost">Save Draft</Button>
                        <Button variant="primary">Publish Now</Button>
                    </div>
                </form>
            </Card>

            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Published Content</h3>
                <Card style={{ padding: 0 }}>
                    {/* List of content items */}
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>How to optimize your Excel workflow</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Published on Jan 20, 2026</div>
                            </div>
                            <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
}
