'use client';

import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';
import Dropcursor from '@tiptap/extension-dropcursor';
import styles from './PageEditor.module.css';
import { useNoteStore, Note } from '@/store/useNoteStore';
import { useEditor, EditorContent } from '@tiptap/react';

import Image from '@tiptap/extension-image';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { EditorView } from '@tiptap/pm/view';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';

const extensions = [
    Document,
    Paragraph,
    Text,
    Heading.configure({ levels: [1, 2, 3] }),
    Bold,
    Italic,
    Strike,
    BulletList,
    OrderedList,
    ListItem,
    CodeBlock,
    Blockquote,
    Blockquote,
    History,
    Dropcursor,
    Image,
    Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === 'heading' && node.attrs.level === 1) {
                return '제목 없음';
            }
            return "내용을 입력하거나 '/'를 눌러 명령어를 사용하세요...";
        },
    }),
];

interface PageEditorProps {
    note: Note;
}

export default function PageEditor({ note }: PageEditorProps) {
    const { updateNote } = useNoteStore();

    // Initialize content with title if content is empty (Migration helper)
    const initialContent = note.content || (note.title ? `<h1>${note.title}</h1>` : '');

    const editor = useEditor({
        extensions,
        content: initialContent,
        editorProps: {
            attributes: {
                class: styles.content,
            },
            handlePaste: (view, event) => {
                const item = event.clipboardData?.items[0];
                if (item?.type.indexOf('image') === 0) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        uploadImage(file, view);
                    }
                    return true;
                }
                return false;
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.indexOf('image') === 0) {
                        event.preventDefault();
                        uploadImage(file, view);
                        return true;
                    }
                }
                return false;
            },
        },
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            // Extract the first block as title if it's a heading
            let title = '';
            if (json.content && json.content.length > 0) {
                const firstNode = json.content[0];
                if (firstNode.content && firstNode.content.length > 0) {
                    title = (firstNode.content[0] as { text?: string }).text || '';
                }
            }

            updateNote(note.id, {
                content: editor.getHTML(),
                title: title
            });
        },
        // We generally want immediatelyRender: false for SSR frameworks to match hydration
        immediatelyRender: false,
    });

    const uploadImage = async (file: File, view: EditorView) => {
        const id = uuidv4();
        const blobUrl = URL.createObjectURL(file);

        // 1. Insert Optimistic Image (Blob URL)
        const { schema } = view.state;
        const node = schema.nodes.image.create({ src: blobUrl });
        const transaction = view.state.tr.replaceSelectionWith(node);
        view.dispatch(transaction);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${id}.${fileExt}`;
            const filePath = `${fileName}`;

            // 2. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                // Optionally remove the blob image here if failed
                return;
            }

            // 3. Get Public URL
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // 4. Swap Blob URL with Real URL
            // Find appropriate transaction to update the exact node
            // Since doc might have changed, we scan for the node with our blobUrl.
            // Note: This scans the whole doc, efficient enough for normal blog posts.
            let foundPos = -1;
            view.state.doc.descendants((descendant: ProsemirrorNode, pos: number) => {
                if (descendant.type.name === 'image' && descendant.attrs.src === blobUrl) {
                    foundPos = pos;
                    return false; // Stop iteration
                }
            });

            if (foundPos > -1) {
                const tr = view.state.tr.setNodeMarkup(foundPos, null, {
                    src: publicUrl
                });
                view.dispatch(tr);
            }

            // Cleanup Blob URL to free memory
            // URL.revokeObjectURL(blobUrl); 
            // (Optional: keep it for a bit if needed or revoke instantly. Revoking instantly usually holds frame.)

        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    // Update editor content if note changes externally (e.g. from a fresh fetch or another source)
    // Be careful not to create infinite loops or reset cursor position while typing
    // For now, only update if the editor is empty or on mount.
    // Complex real-time collaboration needs Y.js, but for local-first single user:


    if (!editor) {
        return null;
    }

    return (
        <div className={styles.pageContainer}>
            <div style={{
                position: 'fixed',
                top: 20,
                right: 40,
                zIndex: 100,
                display: 'flex',
                gap: 12,
                alignItems: 'center'
            }}>
                {note.isPublished && (
                    <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 600 }}>
                        ● 게시됨 (Published)
                    </span>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        updateNote(note.id, { isPublished: !note.isPublished });
                    }}
                    style={{
                        padding: '6px 12px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        borderRadius: 6,
                        border: '1px solid var(--border-secondary)',
                        background: note.isPublished ? 'transparent' : 'var(--text-primary)',
                        color: note.isPublished ? 'var(--text-secondary)' : 'var(--bg-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    {note.isPublished ? '게시 취소' : '게시하기'}
                </button>
            </div>
            <div className={styles.editorWrapper} onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
