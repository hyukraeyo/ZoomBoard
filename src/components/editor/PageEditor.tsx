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
import { useEffect } from 'react';

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
    History,
    Dropcursor,
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

    // Update editor content if note changes externally (e.g. from a fresh fetch or another source)
    // Be careful not to create infinite loops or reset cursor position while typing
    // For now, only update if the editor is empty or on mount.
    // Complex real-time collaboration needs Y.js, but for local-first single user:
    useEffect(() => {
        if (editor && note.content && editor.getHTML() !== note.content) {
            // Only update if completely different? 
            // Actually, with local state, we rely on onUpdate to push changes.
            // We shouldn't pull changes back unless we implement Undo/Redo via store or something.
            // But if we switch notes, the component remounts, so new content is loaded via initialContent.
            // So this useEffect might not be needed if key={note.id} is used on the parent.
        }
    }, [note.id, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.editorWrapper} onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
