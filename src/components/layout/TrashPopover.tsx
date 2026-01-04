'use client';

import { useNoteStore } from '@/store/useNoteStore';
import { useEffect, useState } from 'react';
import { Trash2, Undo2, Search } from 'lucide-react';
import styles from './TrashPopover.module.css';

interface TrashPopoverProps {
    position: { top: number; left: number };
}

export default function TrashPopover({ position }: TrashPopoverProps) {
    const { trashNotes, fetchTrashNotes, restoreNote, permanentlyDeleteNote } = useNoteStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTrashNotes();
    }, [fetchTrashNotes]);

    const filteredNotes = trashNotes.filter(note =>
        (note.title || '새 페이지').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRestore = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await restoreNote(id);
    };

    const handleDeleteForever = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('이 페이지를 영구적으로 삭제하시겠습니까? 복구할 수 없습니다.')) {
            await permanentlyDeleteNote(id);
        }
    };

    return (
        <div
            className={styles.popover}
            style={{ top: position.top, left: position.left }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.header}>
                <div className={styles.searchWrapper}>
                    <Search size={14} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="휴지통에서 페이지 검색"
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            <div className={styles.list}>
                {filteredNotes.length === 0 ? (
                    <div className={styles.empty}>휴지통이 비었습니다.</div>
                ) : (
                    filteredNotes.map(note => (
                        <div key={note.id} className={styles.item}>
                            <span className={styles.itemTitle}>{note.title || '새 페이지'}</span>
                            <div className={styles.actions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={(e) => handleRestore(e, note.id)}
                                    title="Restore"
                                >
                                    <Undo2 size={14} />
                                </button>
                                <button
                                    className={styles.actionBtn}
                                    onClick={(e) => handleDeleteForever(e, note.id)}
                                    title="Delete Forever"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className={styles.footer}>
                <div className={styles.info}>
                    {/* 30일 자동 삭제 문구 제거됨 */}
                </div>
            </div>
        </div>
    );
}
