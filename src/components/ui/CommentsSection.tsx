"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';

interface CommentsSectionProps {
    moduleId: string;
    isAdmin?: boolean;
}

export default function CommentsSection({ moduleId, isAdmin }: CommentsSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [postingReply, setPostingReply] = useState(false);

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('lesson_comments')
            .select(`
                id,
                content,
                created_at,
                user_id,
                parent_id,
                users ( id, full_name, role )
            `)
            .eq('module_id', moduleId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setComments(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (moduleId) {
            fetchComments();
            setReplyingTo(null);
            setReplyContent('');
        }
    }, [moduleId]);

    const handlePostComment = async (parentId?: string) => {
        const content = parentId ? replyContent.trim() : newComment.trim();
        if (!content || !user) return;
        
        if (parentId) setPostingReply(true);
        else setPosting(true);

        const { error } = await supabase
            .from('lesson_comments')
            .insert({
                module_id: moduleId,
                user_id: user.id,
                content: content,
                parent_id: parentId || null
            });

        if (!error) {
            if (parentId) {
                setReplyContent('');
                setReplyingTo(null);
            } else {
                setNewComment('');
            }
            await fetchComments();
        } else {
            alert('Failed to post comment. Ensure the latest SQL migration (add_reply_support.sql) is applied.');
        }
        
        if (parentId) setPostingReply(false);
        else setPosting(false);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        
        const { error } = await supabase
            .from('lesson_comments')
            .delete()
            .eq('id', commentId);

        if (!error) {
            setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
        } else {
            alert('Failed to delete comment.');
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    const topLevelComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId).reverse(); 

    return (
        <div style={{ marginTop: '3rem', borderTop: '2px solid #e2e8f0', paddingTop: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.8rem' }}>💬</span> Discussion Q&A ({comments.length})
            </h3>

            {/* Top-Level Post Area */}
            {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question or share your thoughts on this lesson..."
                        style={{
                            width: '100%', minHeight: '120px', padding: '1rem',
                            borderRadius: '0.5rem', border: '1px solid #cbd5e1',
                            fontFamily: 'inherit', fontSize: '1rem', resize: 'vertical',
                            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="primary" onClick={() => handlePostComment()} disabled={posting || !newComment.trim()} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none' }}>
                            {posting ? 'Posting...' : 'Post Comment'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', color: '#64748b', marginBottom: '2rem', textAlign: 'center', fontWeight: 500 }}>
                    Please log in to participate in the discussion.
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div style={{ color: '#94a3b8' }}>Loading discussion...</div>
            ) : topLevelComments.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                    No comments yet. Be the first to start the discussion!
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {topLevelComments.map((comment) => (
                        <div key={comment.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            
                            {/* Parent Comment Header */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: comment.users?.role === 'admin' ? '#0284c7' : '#e2e8f0', color: comment.users?.role === 'admin' ? 'white' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '1.2rem' }}>
                                    {comment.users?.full_name?.charAt(0) || 'S'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.05rem' }}>
                                                {comment.users?.full_name || 'Unknown Student'}
                                            </span>
                                            {comment.users?.role === 'admin' && (
                                                <span style={{ fontSize: '0.7rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontWeight: 700, border: '1px solid #bae6fd' }}>
                                                    INSTRUCTOR
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                                            {formatTimeAgo(comment.created_at)}
                                        </span>
                                    </div>
                                    <p style={{ color: '#334155', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                        {comment.content}
                                    </p>
                                    
                                    {/* Action Bar (Reply + Delete) */}
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem' }}>
                                        {user && (
                                            <button 
                                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} 
                                                style={{ color: '#0284c7', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, transition: 'opacity 0.2s' }}
                                            >
                                                {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
                                            </button>
                                        )}
                                        {user && (user.id === comment.user_id || isAdmin) && (
                                            <button 
                                                onClick={() => handleDelete(comment.id)} 
                                                style={{ color: '#ef4444', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600, transition: 'opacity 0.2s' }}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reply Input Form */}
                            {replyingTo === comment.id && (
                                <div style={{ marginLeft: '3.8rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <textarea 
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder={`Reply to ${comment.users?.full_name}...`}
                                        style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }}
                                        autoFocus
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button variant="primary" onClick={() => handlePostComment(comment.id)} disabled={postingReply || !replyContent.trim()} size="sm" style={{ backgroundColor: '#0284c7', border: 'none', color: 'white' }}>
                                            {postingReply ? 'Sending...' : 'Post Reply'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Threaded Replies */}
                            {getReplies(comment.id).length > 0 && (
                                <div style={{ marginLeft: '3.8rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid #e2e8f0', paddingLeft: '1.5rem' }}>
                                    {getReplies(comment.id).map(reply => (
                                        <div key={reply.id} style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: reply.users?.role === 'admin' ? '#0ea5e9' : '#f1f5f9', color: reply.users?.role === 'admin' ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '0.9rem' }}>
                                                {reply.users?.full_name?.charAt(0) || 'S'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                        <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
                                                            {reply.users?.full_name || 'Unknown Student'}
                                                        </span>
                                                        {reply.users?.role === 'admin' && (
                                                            <span style={{ fontSize: '0.65rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 700, border: '1px solid #bae6fd' }}>
                                                                INSTRUCTOR
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                        {formatTimeAgo(reply.created_at)}
                                                    </span>
                                                </div>
                                                <p style={{ color: '#475569', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                                    {reply.content}
                                                </p>
                                                
                                                {/* Edit/Delete Reply */}
                                                {user && (user.id === reply.user_id || isAdmin) && (
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        <button 
                                                            onClick={() => handleDelete(reply.id)} 
                                                            style={{ color: '#ef4444', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

