'use client';

import { useParams } from 'next/navigation';
import { useNoteStore } from '@/store/useNoteStore';
import PageEditor from '@/components/editor/PageEditor';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function NotePage() {
    const params = useParams();
    const id = params?.id as string;
    const { notes, isLoading, fetchNotes } = useNoteStore();
    const [note, setNote] = useState(notes.find(n => n.id === id));

    useEffect(() => {
        if (notes.length === 0 && !isLoading) {
            fetchNotes();
        }
    }, [notes.length, isLoading, fetchNotes]);

    useEffect(() => {
        setNote(notes.find(n => n.id === id));
    }, [notes, id]);

    if (isLoading && !note) {
        return (
            <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    Note not found
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {/* Key ensures editor remounts when note changes, resetting content */}
                <PageEditor key={note.id} note={note} />
            </div>
        </div>
    );
}
