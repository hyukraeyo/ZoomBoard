'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './Editor.module.css';
import { useNoteStore, Note } from '@/store/useNoteStore';
import { useRef } from 'react';
import Draggable, { DraggableEvent } from 'react-draggable';

const extensions = [
    StarterKit,
    Placeholder.configure({
        placeholder: 'Type \'/\' for commands...',
    }),
];

interface NoteComponentProps {
    note: Note;
    scale: number;
}

export default function NoteComponent({ note, scale }: NoteComponentProps) {
    const { updateNote, bringToFront } = useNoteStore();
    const nodeRef = useRef(null);

    const editor = useEditor({
        extensions,
        content: note.content || '',
        editorProps: {
            attributes: {
                class: styles.content,
            },
        },
        onUpdate: ({ editor }) => {
            // Debounce could be added here for performance
            updateNote(note.id, { content: editor.getHTML() });
        },
        immediatelyRender: false,
    });

    // Handle Drag Stop
    const handleStop = (e: DraggableEvent, data: { x: number; y: number }) => {
        updateNote(note.id, { x: data.x, y: data.y });
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            handle={`.${styles.dragHandle}`}
            defaultPosition={{ x: note.x, y: note.y }}
            onStart={() => bringToFront(note.id)}
            onStop={handleStop}
            scale={scale} // Important for dragging inside zoom
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
                    <input
                        type="text"
                        placeholder="Untitled"
                        className={styles.titleInput}
                        value={note.title}
                        onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    />
                    <EditorContent editor={editor} />
                </div>
            </div>
        </Draggable>
    );
}
