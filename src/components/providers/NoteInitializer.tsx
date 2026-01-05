'use client';

import { useEffect, useRef } from 'react';
import { useNoteStore, Note } from '@/store/useNoteStore';

export default function NoteInitializer({ notes, isSidebarOpen, isLocked }: { notes: Note[], isSidebarOpen?: boolean, isLocked?: boolean }) {
    const { setNotes } = useNoteStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updates: any = {};
            if (isSidebarOpen !== undefined) updates.isSidebarOpen = isSidebarOpen;
            if (isLocked !== undefined) updates.isLocked = isLocked;

            if (Object.keys(updates).length > 0) {
                useNoteStore.setState(updates);
            }
            initialized.current = true;
        }
    }, [isSidebarOpen, isLocked]);

    useEffect(() => {
        // Hydrate store immediately
        if (notes && notes.length > 0) {
            setNotes(notes);
        }
        useNoteStore.setState({ isInitialized: true });
    }, [notes, setNotes]);

    return null;
}
