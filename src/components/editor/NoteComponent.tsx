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
import styles from './Editor.module.css';
import { useNoteStore, Note } from '@/store/useNoteStore';
import { useRef } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { useEditor, EditorContent } from '@tiptap/react';

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
                return '새 페이지';
            }
            return "내용을 입력하거나 '/'를 눌러 명령어를 사용하세요...";
        },
    }),
];

interface NoteComponentProps {
    note: Note;
    scale: number;
}

export default function NoteComponent({ note, scale }: NoteComponentProps) {
    const { updateNote, bringToFront } = useNoteStore();
    const nodeRef = useRef<HTMLDivElement>(null);

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
        immediatelyRender: false,
    });

    // Handle Drag Stop
    const handleStop = (e: DraggableEvent, data: DraggableData) => {
        updateNote(note.id, { x: data.x, y: data.y });
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            handle={`.${styles.dragHandle}`}
            defaultPosition={{ x: note.x, y: note.y }}
            onStart={() => { bringToFront(note.id); }}
            onStop={handleStop}
            scale={scale}
        >
            <div
                ref={nodeRef}
                className={`${styles.noteContainer} note-item`}
                style={{ zIndex: note.zIndex || 1 }}
                onMouseDownCapture={() => bringToFront(note.id)}
            >
                <div className={styles.editorWrapper} onClick={() => {
                    bringToFront(note.id);
                    editor?.chain().focus().run();
                }}>
                    <div className={`${styles.dragHandle} drag-handle-class`} title="Drag to move" />
                    <EditorContent editor={editor} />
                </div>
            </div>
        </Draggable>
    );
}
