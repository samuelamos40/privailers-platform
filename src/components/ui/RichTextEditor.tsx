"use client";

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

// Dynamically import ReactQuill to avoid "document is not defined" SSR errors
const ReactQuill = dynamic(() => import('react-quill'), { 
    ssr: false,
    loading: () => <div style={{ height: '200px', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading Editor...</div>
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

export default function RichTextEditor({ value, onChange, placeholder, style }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'blockquote', 'code-block'],
            ['clean']
        ],
    };

    return (
        <div className="rich-text-wrapper" style={{ ...style }}>
            <style jsx global>{`
                .rich-text-wrapper .ql-container {
                    font-family: inherit;
                    font-size: 1rem;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    min-height: 150px;
                }
                .rich-text-wrapper .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background-color: #f8fafc;
                }
                .rich-text-wrapper .ql-editor {
                    min-height: 150px;
                }
            `}</style>
            <ReactQuill 
                theme="snow" 
                value={value} 
                onChange={onChange} 
                modules={modules}
                placeholder={placeholder || 'Write your content here...'}
            />
        </div>
    );
}
