'use client';

import { useNoteStore } from '@/store/useNoteStore';
import dynamic from "next/dynamic";

const PageEditor = dynamic(() => import("@/components/editor/PageEditor"), {
    ssr: false,
    loading: () => <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>에디터 로드 중...</div>
});
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClientNotePage({ initialNote, id }: { initialNote: any, id: string }) {
    const { notes, setFocusedNoteId } = useNoteStore();
    const { user } = useAuthStore();

    // Find note in store if already there, otherwise use initialNote
    // Find note in store if already there, otherwise use initialNote
    const note = useMemo(() => {
        const noteInStore = notes.find(n => n.id === id);
        return noteInStore || {
            id: initialNote.id,
            x: initialNote.x,
            y: initialNote.y,
            title: initialNote.title,
            content: initialNote.content,
            createdAt: Number(initialNote.created_at),
            zIndex: initialNote.z_index,
            deletedAt: initialNote.deleted_at ? Number(initialNote.deleted_at) : null,
            isPublished: initialNote.is_published || false,
            userId: initialNote.user_id || null,
        };
    }, [notes, id, initialNote]);

    const isEditable = useMemo(() => {
        return user !== null && note.userId === user.id;
    }, [note, user]);

    useEffect(() => {
        setFocusedNoteId(id);
    }, [id, setFocusedNoteId]);

    if (!note.isPublished && !isEditable) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 8 }}>접근 권한이 없는 페이지입니다.</h2>
                    <p style={{ fontSize: '0.9rem' }}>비공개 페이지는 작성자만 확인할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
            <PageEditor key={note.id} note={note} editable={isEditable} />
        </div>
    );
}
