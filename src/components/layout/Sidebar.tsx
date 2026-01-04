'use client';

import { useNoteStore } from '@/store/useNoteStore';
import styles from './Sidebar.module.css';
import { FileText, Plus, Search, Home, Settings, MoreHorizontal, Trash2, Menu, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TrashPopover from './TrashPopover';

export default function Sidebar() {
    const {
        notes,
        setFocusedNoteId,
        focusedNoteId,
        addNote,
        deleteNote,
        isSidebarOpen,
        setIsSidebarOpen,
        isLocked,

        setIsLocked
    } = useNoteStore();
    const router = useRouter();
    const [activeMenu, setActiveMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const [trashOpen, setTrashOpen] = useState(false);
    const [trashPosition, setTrashPosition] = useState({ top: 0, left: 0 });
    const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);

    // Sort notes by Creation time for the list (Newest first)
    // or you might want Alphabetical. let's go with CreatedAt for now.
    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [notes]);

    const handleNoteClick = (id: string) => {
        setFocusedNoteId(id);
        router.push(`/notes/${id}`);
    };

    const handleAddPage = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const newNoteId = await addNote(0, 0);
        router.push(`/notes/${newNoteId}`);
    };

    const openMenu = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTrashOpen(false); // Close trash if open
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setActiveMenu({ id, x: rect.right, y: rect.bottom });
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteNote(id);
        setActiveMenu(null);
        if (focusedNoteId === id) {
            setFocusedNoteId(null);
        }
    };

    const toggleTrash = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (trashOpen) {
            setTrashOpen(false);
            return;
        }
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTrashPosition({ top: rect.top, left: rect.right + 10 });
        setTrashOpen(true);
        setActiveMenu(null); // Close other menus
    };

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveMenu(null);
            setTrashOpen(false);
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <>
            {/* Hamburger Trigger */}

            <div
                style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 1000, /* Ensure it is above everything */
                    opacity: (isSidebarOpen && isLocked) ? 0 : 1,
                    pointerEvents: (isSidebarOpen && isLocked) ? 'none' : 'auto',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center'
                }}
                onMouseEnter={() => {
                    setIsHoveringTrigger(true);
                    if (!isLocked) setIsSidebarOpen(true);
                }}
                onMouseLeave={() => setIsHoveringTrigger(false)}
                onClick={() => {
                    setIsLocked(true);
                    setIsSidebarOpen(true);
                }}
            >
                <div style={{ position: 'relative', width: 24, height: 24 }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: isHoveringTrigger ? 0 : 1,
                        transform: isHoveringTrigger ? 'scale(0.8) rotate(-90deg)' : 'scale(1) rotate(0deg)',
                        transition: 'all 0.2s ease',
                    }}>
                        <Menu size={24} color="#9f9f9f" />
                    </div>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: isHoveringTrigger ? 1 : 0,
                        transform: isHoveringTrigger ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(90deg)',
                        transition: 'all 0.2s ease',
                    }}>
                        <ChevronsRight size={24} color="#9f9f9f" />
                    </div>
                </div>

                {/* Tooltip */}
                {isHoveringTrigger && (
                    <div style={{
                        position: 'absolute',
                        left: '100%',
                        marginLeft: 8,
                        background: '#333',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        {isLocked ? '사이드바 닫기' : '사이드바 고정 (클릭)'}
                    </div>
                )}
            </div>

            <aside
                className={[styles.sidebar, !isLocked ? styles.floating : '', !isSidebarOpen ? styles.closed : ''].join(' ')}
                onMouseLeave={() => {
                    if (!isLocked) setIsSidebarOpen(false);
                }}
            >
                <div className={styles.header}>
                    <div className={styles.userProfile}>
                        <div style={{ width: 20, height: 20, background: '#a8a29e', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' }}>
                            J
                        </div>
                        <span>User&apos;s Workspace</span>
                    </div>
                    <div
                        className={styles.closeButton}
                        onClick={() => {
                            setIsLocked(false);
                            setIsSidebarOpen(false);
                        }}
                        title="Close sidebar"
                        style={{ display: !isLocked ? 'none' : 'flex' }}
                    >
                        <ChevronsLeft size={18} />
                    </div>
                </div>

                <div className={styles.noteItem}>
                    <Search size={16} className={styles.icon} />
                    <span>검색 (Search)</span>
                </div>
                <div className={styles.noteItem}>
                    <Home size={16} className={styles.icon} />
                    <span>홈 (Home)</span>
                </div>

                <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={handleAddPage}>
                    <span>개인 페이지 (Private)</span>
                    <Plus size={14} />
                </div>

                <div className={styles.noteList}>
                    {sortedNotes.map(note => (
                        <div
                            key={note.id}
                            className={`${styles.noteItem} ${focusedNoteId === note.id ? styles.active : ''} `}
                            onClick={() => handleNoteClick(note.id)}
                        >
                            <FileText size={16} className={styles.icon} />
                            <span style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flex: 1
                            }}>
                                {note.title || '새 페이지'}
                            </span>

                            <div
                                className={styles.moreButton}
                                onClick={(e) => openMenu(e, note.id)}
                                title="Delete and more..."
                            >
                                <MoreHorizontal size={14} />
                            </div>
                        </div>
                    ))}


                </div>

                <div style={{ marginTop: 24 }}></div>

                <div className={styles.noteItem}>
                    <Settings size={16} className={styles.icon} />
                    <span>설정 (Settings)</span>
                </div>
                <div
                    className={`${styles.noteItem} ${trashOpen ? styles.active : ''} `}
                    onClick={toggleTrash}
                >
                    <Trash2 size={16} className={styles.icon} />
                    <span>휴지통 (Trash)</span>
                </div>

                {/* Render Trash Popover */}
                {trashOpen && (
                    <TrashPopover
                        position={trashPosition}
                    />
                )}

                {activeMenu && (
                    <div
                        className={styles.moreMenu}
                        style={{ top: activeMenu.y, left: activeMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`${styles.moreMenuItem} ${styles.deleteItem} `} onClick={(e) => handleDelete(e, activeMenu.id)}>
                            <Trash2 size={14} />
                            <span>삭제 (Delete)</span>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}
