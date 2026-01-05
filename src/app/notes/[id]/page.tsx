'use client';

import { useParams } from 'next/navigation';
import { useNoteStore } from '@/store/useNoteStore';
import PageEditor from '@/components/editor/PageEditor';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useMemo } from 'react';

export default function NotePage() {
    const params = useParams();
    const id = params?.id as string;
    const { notes, isLoading, fetchNotes, setFocusedNoteId } = useNoteStore();
    const note = useMemo(() => notes.find(n => n.id === id), [notes, id]);
    const { user } = useAuthStore();

    const isEditable = useMemo(() => {
        if (!note) return false;
        // If note has no userId (legacy), anyone logged in can edit? No, let's say only owner.
        // For ZoomBoard, if not logged in, you can only view published notes.
        // If logged in, you can edit your own notes.
        return user !== null && note.userId === user.id;
    }, [note, user]);

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

    if (!note || (!note.isPublished && !isEditable)) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 8 }}>접근 권한이 없거나 존재하지 않는 페이지입니다.</h2>
                    <p style={{ fontSize: '0.9rem' }}>비공개 페이지는 작성자만 확인할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            {/* Key ensures editor remounts when note changes, resetting content */}
            <PageEditor key={note.id} note={note} editable={isEditable} />
        </div>
    );
}
