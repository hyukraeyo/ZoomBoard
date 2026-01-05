'use client';

import { useEffect, useRef } from 'react';
import { useNoteStore, Note } from '@/store/useNoteStore';

export default function NoteInitializer({ notes, isSidebarOpen }: { notes: Note[], isSidebarOpen?: boolean }) {
    const { setNotes } = useNoteStore();
    const initialized = useRef(false);

    if (!initialized.current) {
        if (isSidebarOpen !== undefined) {
            useNoteStore.setState({ isSidebarOpen });
        }
        initialized.current = true;
    }

    useEffect(() => {
        // Hydrate store immediately
        if (notes && notes.length > 0) {
            setNotes(notes);
        }
    }, [notes, setNotes]);

    return null;
}
