'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './Editor.module.css';
import { useNoteStore } from '@/store/useNoteStore';
import { useEffect } from 'react';

const extensions = [
    StarterKit,
    Placeholder.configure({
        placeholder: 'Type \'/\' for commands...',
    }),
];

export default function Editor() {
    const { title, content, setTitle, setContent } = useNoteStore();

    const editor = useEditor({
        extensions,
        content: content || '<p>Start typing here...</p>',
        editorProps: {
            attributes: {
                class: styles.content,
            },
        },
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Hydrate editor content from store when component mounts (handle localStorage persistence)
    useEffect(() => {
        if (editor && content) {
            // Only set content if the editor is empty or default, to avoid overwriting ongoing typing if re-renders happen.
            // However, for this simple case, we trust the store is the source of truth on mount.
            // We check if content is actually different to avoid cursor reset.
            const currentHTML = editor.getHTML();
            if (currentHTML !== content && Math.abs(currentHTML.length - content.length) > 5) { // Simple heuristic or strict equality
                // Strict equality is safer for "first load" restoration
                if (editor.getText().trim() === '' && content !== '<p></p>') {
                    editor.commands.setContent(content);
                }
            }
        }
    }, [editor, content]);

    return (
        <div className={styles.editorWrapper} onClick={() => editor?.chain().focus().run()}>
            <input
                type="text"
                placeholder="Untitled"
                className={styles.titleInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <EditorContent editor={editor} />
        </div>
    );
}
