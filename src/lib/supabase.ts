import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export type User = {
    id: string;
    email: string;
    full_name: string;
    role: 'student' | 'admin' | 'instructor';
    access_status?: 'active' | 'deactivated';
    access_expires_at?: string;
    created_at: string;
};

export type Course = {
    id: string;
    title: string;
    description: string;
    tier: 'free' | 'paid';
    duration: string;
    price?: number;
    created_at: string;
};

export type Enrollment = {
    id: string;
    user_id: string;
    course_id: string;
    progress: number;
    status: 'active' | 'completed' | 'paused';
    enrolled_at: string;
    last_accessed: string;
};

export type Module = {
    id: string;
    course_id: string;
    title: string;
    order: number;
    content: string;
    video_url?: string;
};

export type ModuleProgress = {
    id: string;
    user_id: string;
    module_id: string;
    completed: boolean;
    completed_at?: string;
};

export type Project = {
    id: string;
    user_id: string;
    course_id: string;
    title: string;
    description: string;
    file_url?: string;
    status: 'draft' | 'submitted' | 'reviewed';
    submitted_at?: string;
    feedback?: string;
};

export type Lead = {
    id: string;
    name: string;
    email: string;
    company?: string;
    interest: string;
    message: string;
    status: 'new' | 'contacted' | 'qualified' | 'closed';
    created_at: string;
    updated_at: string;
};

export type Content = {
    id: string;
    title: string;
    type: 'article' | 'tip' | 'announcement';
    content: string;
    author_id: string;
    published: boolean;
    created_at: string;
    updated_at: string;
};
