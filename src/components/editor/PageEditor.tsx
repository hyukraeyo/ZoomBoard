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
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import SlashCommand, { getSuggestionItems, renderItems } from './extensions/SlashCommand';
import styles from './PageEditor.module.css';
import { useNoteStore, Note } from '@/store/useNoteStore';
import { useEditor, EditorContent } from '@tiptap/react';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';

import { CustomImage } from './extensions/CustomImage';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { EditorView } from '@tiptap/pm/view';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { useEffect, useState, useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight, Maximize, Minimize } from 'lucide-react';
import tippy from 'tippy.js';

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
    Dropcursor.configure({
        color: 'var(--accent-primary)',
        width: 2,
    }),
    CustomImage,
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
    SlashCommand.configure({
        suggestion: {
            items: getSuggestionItems,
            render: renderItems,
        },
    }),
    BubbleMenuExtension,
    Placeholder.configure({
        placeholder: ({ node }) => {
            if (node.type.name === 'heading' && node.attrs.level === 1) {
                return '제목 없음';
            }
            return "내용을 입력하거나 '/'를 눌러 명령어를 사용하세요...";
        },
        includeChildren: true,
    }),
];

interface PageEditorProps {
    note: Note;
}

export default function PageEditor({ note }: PageEditorProps) {
    const { updateNote } = useNoteStore();
    const imageToolbarRef = useRef<HTMLDivElement>(null);

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
            const html = editor.getHTML();
            const text = editor.getText();

            // Refined title extraction: 
            // 1. If first node is a heading, use its text.
            // 2. Otherwise, use a truncated version of the first paragraph or the overall text.
            let title = '';
            const firstNode = editor.state.doc.firstChild;

            if (firstNode) {
                if (firstNode.type.name === 'heading' || firstNode.type.name === 'paragraph') {
                    title = firstNode.textContent;
                }
            }

            // Fallback for very short content or empty headings
            if (!title && text) {
                title = text.slice(0, 30).split('\n')[0];
            }

            updateNote(note.id, {
                content: html,
                title: title.trim()
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

    useEffect(() => {
        if (!editor || !imageToolbarRef.current) {
            return;
        }

        const toolbar = imageToolbarRef.current;
        let tippyInstance: any = null;

        const updateToolbar = () => {
            if (!editor.isActive('image')) {
                toolbar.classList.remove('visible');
                tippyInstance?.hide();
                return;
            }

            const { view, state } = editor;
            const { selection } = state;
            const { from, to } = selection;

            // Find the image node
            let imageNodePos: number | null = null;
            state.doc.nodesBetween(from, to, (node, pos) => {
                if (node.type.name === 'image') {
                    imageNodePos = pos;
                    return false; // Stop iterating
                }
            });

            if (imageNodePos === null) {
                toolbar.classList.remove('visible');
                tippyInstance?.hide();
                return;
            }

            const node = state.doc.nodeAt(imageNodePos);
            if (!node || node.type.name !== 'image') {
                toolbar.classList.remove('visible');
                tippyInstance?.hide();
                return;
            }

            const coords = view.coordsAtPos(imageNodePos);
            const imageElement = view.nodeDOM(imageNodePos) as HTMLElement;

            if (!imageElement) {
                toolbar.classList.remove('visible');
                tippyInstance?.hide();
                return;
            }

            const { top, left, width } = imageElement.getBoundingClientRect();

            if (!tippyInstance) {
                tippyInstance = tippy(imageElement, {
                    getReferenceClientRect: () => imageElement.getBoundingClientRect(),
                    appendTo: () => document.body,
                    content: toolbar,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'top',
                    offset: [0, 10],
                    duration: 0,
                    animation: 'fade',
                    onShown: () => {
                        toolbar.classList.add('visible');
                    },
                    onHide: () => {
                        toolbar.classList.remove('visible');
                    },
                });
            } else {
                tippyInstance.setProps({
                    getReferenceClientRect: () => imageElement.getBoundingClientRect(),
                });
                tippyInstance.show();
            }
        };

        editor.on('selectionUpdate', updateToolbar);
        editor.on('transaction', updateToolbar); // Also update on transaction to catch attribute changes

        return () => {
            editor.off('selectionUpdate', updateToolbar);
            editor.off('transaction', updateToolbar);
            tippyInstance?.destroy();
        };
    }, [editor]);


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
            <div
                className={styles.editorWrapper}
                onClick={() => editor.chain().focus().run()}
                style={{ opacity: 0, animation: 'fadeIn 0.5s ease forwards' }}
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .image-bubble-menu {
                        display: flex;
                        background: var(--bg-primary);
                        border: 1px solid var(--border-primary);
                        border-radius: 8px;
                        padding: 4px;
                        box-shadow: var(--shadow-sm);
                        gap: 2px;
                        z-index: 10000;
                        position: absolute;
                        visibility: hidden;
                        opacity: 0;
                        transition: opacity 0.2s, visibility 0.2s;
                    }
                    .image-bubble-menu.visible {
                        visibility: visible;
                        opacity: 1;
                    }
                    .bubble-btn {
                        padding: 6px;
                        border-radius: 4px;
                        border: none;
                        background: transparent;
                        color: var(--text-secondary);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    }
                    .bubble-btn:hover {
                        background: var(--hover-bg);
                        color: var(--text-primary);
                    }
                    .bubble-btn.active {
                        color: var(--accent-primary);
                        background: var(--accent-surface);
                    }
                ` }} />

                <div
                    id="image-toolbar"
                    ref={imageToolbarRef}
                    className={`image-bubble-menu ${editor.isActive('image') ? 'visible' : ''}`}
                    style={{
                        position: 'fixed',
                        // Note: Positioning will be handled by Tippy or manual logic below
                    }}
                >
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'left' }).run()}
                        className={`bubble-btn ${editor.getAttributes('image').alignment === 'left' ? 'active' : ''}`}
                        title="Align Left"
                    >
                        <AlignLeft size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'center' }).run()}
                        className={`bubble-btn ${editor.getAttributes('image').alignment === 'center' ? 'active' : ''}`}
                        title="Align Center"
                    >
                        <AlignCenter size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'right' }).run()}
                        className={`bubble-btn ${editor.getAttributes('image').alignment === 'right' ? 'active' : ''}`}
                        title="Align Right"
                    >
                        <AlignRight size={18} />
                    </button>
                    <div style={{ width: 1, height: 20, background: 'var(--border-primary)', margin: '0 4px', alignSelf: 'center' }} />
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()}
                        className="bubble-btn"
                        title="Small"
                    >
                        <Minimize size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
                        className="bubble-btn"
                        title="Large"
                    >
                        <Maximize size={18} />
                    </button>
                </div>

                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
