'use client';

import { useParams } from 'next/navigation';
import { useNoteStore } from '@/store/useNoteStore';
import PageEditor from '@/components/editor/PageEditor';
import { useEffect, useMemo } from 'react';

export default function NotePage() {
    const params = useParams();
    const id = params?.id as string;
    const { notes, isLoading, fetchNotes, setFocusedNoteId } = useNoteStore();
    const note = useMemo(() => notes.find(n => n.id === id), [notes, id]);

    useEffect(() => {
        setFocusedNoteId(id);
    }, [id, setFocusedNoteId]);

    useEffect(() => {
        if (notes.length === 0 && !isLoading) {
            fetchNotes(); // Keep this for now, though layout fetches initial data
        }
    }, [notes.length, isLoading, fetchNotes]);

    if (isLoading && !note) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                Loading...
            </div>
        );
    }

    if (!note) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                Note not found
            </div>
        );
    }

    return (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            {/* Key ensures editor remounts when note changes, resetting content */}
            <PageEditor key={note.id} note={note} />
        </div>
    );
}
