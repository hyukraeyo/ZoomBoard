'use client';

import { useNoteStore } from '@/store/useNoteStore';
import styles from './Sidebar.module.css';
import { FileText, Plus, Search, Home, Settings, MoreHorizontal, Trash2, Menu, ChevronsLeft, ChevronsRight, LogIn, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useMemo, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import TrashPopover from './TrashPopover';

import { Note } from '@/store/useNoteStore';

interface SidebarProps {
    initialIsOpen?: boolean;
    initialIsLocked?: boolean;
    initialNotes?: Note[];
}

export default function Sidebar({ initialIsOpen, initialIsLocked, initialNotes = [] }: SidebarProps) {
    const {
        notes,
        setFocusedNoteId,
        focusedNoteId,
        addNote,
        deleteNote,
        isSidebarOpen,
        setIsSidebarOpen,
        isLocked,
        setIsLocked,
        isLoading,
        fetchNotes,
        isInitialized
    } = useNoteStore();
    const router = useRouter();
    const pathname = usePathname();
    const [activeMenu, setActiveMenu] = useState<{ id: string; x: number; y: number } | null>(null);
    const [trashOpen, setTrashOpen] = useState(false);
    const [trashPosition, setTrashPosition] = useState({ top: 0, left: 0 });
    const [isHoveringTrigger, setIsHoveringTrigger] = useState(false);
    const { user, signOut } = useAuthStore();

    // Hydration Mismatch Fix:
    // 서버 사이드 및 첫 렌더링 시에는 쿠키에서 가져온 initialIsOpen 값을 우선 사용
    // 마운트 이후에는 zustand store의 live state를 사용
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Only fetch if we are logged in - to get private notes
        // Public notes are already fetched via SSR (NoteInitializer)
        if (user) {
            fetchNotes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const sidebarState = isMounted ? isSidebarOpen : (initialIsOpen ?? true);
    const sidebarLockedState = isMounted ? isLocked : (initialIsLocked ?? true);

    // Sort notes by Creation time for the list (Newest first)
    // or you might want Alphabetical. let's go with CreatedAt for now.
    // Sort and filter notes by Publication status
    // Use initialNotes until store is initialized to prevent flash
    const displayNotes = isInitialized ? notes : initialNotes;

    const publishedNotes = useMemo(() => {
        return displayNotes
            .filter(note => note.isPublished && (!user || note.userId === user.id))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [displayNotes, user]);

    const unpublishedNotes = useMemo(() => {
        return displayNotes
            .filter(note => !note.isPublished && (user ? note.userId === user.id : false))
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }, [displayNotes, user]);

    const handleNoteClick = (id: string) => {
        setFocusedNoteId(id);
        router.push(`/notes/${id}`);
    };

    const handleAddPage = async (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!user) {
            router.push('/login');
            return;
        }
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

    // 현재 포커스된 노트의 제목 가져오기 - 깜빡임 방지
    const [previousTitle, setPreviousTitle] = useState<string | null>('홈 (Home)');

    const currentNoteTitle = useMemo(() => {
        if (pathname === '/') {
            setPreviousTitle('홈 (Home)');
            return '홈 (Home)';
        }

        if (!focusedNoteId || !pathname.startsWith('/notes/')) {
            return null;
        }

        const note = notes.find(n => n.id === focusedNoteId);
        if (!note) {
            // 노트가 아직 로드되지 않았으면 이전 제목 유지 (깜빡임 방지)
            return previousTitle;
        }

        const newTitle = note.title || '새 페이지';
        setPreviousTitle(newTitle);
        return newTitle;
    }, [focusedNoteId, notes, pathname, previousTitle]);

    return (
        <>
            {/* Top Header Bar - 항상 왼쪽 상단에 위치 */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 240, // 사이드바 너비와 일치시켜 오버플로우 방지
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px', // 아이콘 중심축을 24px로 맞추기 위한 패딩 (12 + 12 = 24)
                    zIndex: 1001,
                    background: 'transparent',
                    pointerEvents: 'none',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        pointerEvents: 'auto',
                        width: '100%',
                    }}
                    onMouseEnter={() => {
                        if (!isSidebarOpen) {
                            setIsHoveringTrigger(true);
                            setIsLocked(false);
                            setIsSidebarOpen(true);
                        }
                    }}
                    onMouseLeave={() => setIsHoveringTrigger(false)}
                >
                    {/* Icon Button Area */}
                    <div
                        style={{
                            cursor: 'pointer',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            width: 24, // 총 너비 24px
                            height: 24, // 총 높이 24px
                            flexShrink: 0,
                            // hover 시 배경색이 예쁘게 보이도록 하기 위해 padding 대신 가상 요소를 쓰거나 직접 크기 조절
                        }}
                        className={styles.sidebarIconHover} // CSS 클래스로 호버 처리 권장
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isLocked) {
                                setIsLocked(false);
                                setIsSidebarOpen(false);
                            } else {
                                setIsLocked(true);
                                setIsSidebarOpen(true);
                            }
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {/* 1. Locked State: ChevronsLeft */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: isLocked
                                ? 'translate(-50%, -50%)'
                                : 'translate(-50%, -50%) scale(0.8) rotate(90deg)',
                            opacity: isLocked ? 1 : 0,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                        }}>
                            <ChevronsLeft size={16} color="var(--text-tertiary)" />
                        </div>
                        {/* 2. Floating/Hover State: ChevronsRight */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: (!isLocked && (isSidebarOpen || isHoveringTrigger))
                                ? 'translate(-50%, -50%)'
                                : 'translate(-50%, -50%) scale(0.8) rotate(90deg)',
                            opacity: (!isLocked && (isSidebarOpen || isHoveringTrigger)) ? 1 : 0,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                        }}>
                            <ChevronsRight size={16} color="var(--text-tertiary)" />
                        </div>
                        {/* 3. Closed State: Menu */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: (!isSidebarOpen && !isHoveringTrigger)
                                ? 'translate(-50%, -50%)'
                                : 'translate(-50%, -50%) scale(0.8) rotate(-90deg)',
                            opacity: (!isSidebarOpen && !isHoveringTrigger) ? 1 : 0,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                        }}>
                            <Menu size={16} color="var(--text-tertiary)" />
                        </div>
                    </div>

                    {/* Page Title - 수평 정렬 일치 */}
                    {currentNoteTitle && (
                        <span style={{
                            fontSize: 14,
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 160,
                            flexShrink: 1,
                        }}>
                            {currentNoteTitle}
                        </span>
                    )}
                </div>
            </div>



            <aside
                className={`
                    ${styles.sidebar} 
                    ${!sidebarLockedState ? styles.floating : ''} 
                    ${!sidebarState ? styles.closed : ''}
                `.trim()}
                onMouseLeave={() => {
                    if (!isLocked) setIsSidebarOpen(false);
                }}
            >
                {/* 상단 여백 (고정 모드일 때만 헤더 높이만큼 확보, 플로팅일 때는 조금만) */}
                <div style={{ height: isLocked ? 44 : 12 }} />

                <div className={styles.noteItem}>
                    <Search size={16} className={styles.icon} />
                    <span>검색 (Search)</span>
                </div>
                <div
                    className={`${styles.noteItem} ${pathname === '/' ? styles.active : ''}`}
                    onClick={() => {
                        setFocusedNoteId(null);
                        router.push('/');
                    }}
                >
                    <Home size={16} className={styles.icon} />
                    <span>홈 (Home)</span>
                </div>

                {/* 게시중인 페이지 (Published) - 로그인한 사용자만 표시 */}
                {user && (
                    <>
                        <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>게시중인 페이지 (Published)</span>
                        </div>
                        <div className={styles.noteList}>
                            {isLoading && publishedNotes.length === 0 ? (
                                <>
                                    <div className={styles.skeletonItem}>
                                        <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
                                        <div className={`${styles.skeletonText} ${styles.skeleton}`} />
                                    </div>
                                    <div className={styles.skeletonItem}>
                                        <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
                                        <div className={`${styles.skeletonText} ${styles.skeleton}`} />
                                    </div>
                                </>
                            ) : (
                                publishedNotes.map(note => (
                                    <div
                                        key={note.id}
                                        className={`${styles.noteItem} ${(focusedNoteId === note.id && pathname.startsWith('/notes/')) ? styles.active : ''} `}
                                        onClick={() => handleNoteClick(note.id)}
                                    >
                                        <FileText size={16} className={styles.icon} />
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            flex: 1,
                                            minWidth: 0
                                        }}>
                                            {note.title || '새 페이지'}
                                        </span>
                                        <div
                                            className={styles.moreButton}
                                            onClick={(e) => openMenu(e, note.id)}
                                        >
                                            <MoreHorizontal size={14} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* 게시되지 않은 페이지 (Unpublished / Private) */}
                {user && (
                    <>
                        <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginTop: 16 }} onClick={handleAddPage}>
                            <span>게시되지 않은 페이지 (Unpublished)</span>
                            <Plus size={14} />
                        </div>

                        <div className={styles.noteList}>
                            {isLoading && unpublishedNotes.length === 0 ? (
                                <>
                                    <div className={styles.skeletonItem}>
                                        <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
                                        <div className={`${styles.skeletonText} ${styles.skeleton}`} />
                                    </div>
                                    <div className={styles.skeletonItem}>
                                        <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
                                        <div className={`${styles.skeletonText} ${styles.skeleton}`} />
                                    </div>
                                    <div className={styles.skeletonItem}>
                                        <div className={`${styles.skeletonIcon} ${styles.skeleton}`} />
                                        <div className={`${styles.skeletonText} ${styles.skeleton}`} />
                                    </div>
                                </>
                            ) : (
                                unpublishedNotes.map(note => (
                                    <div
                                        key={note.id}
                                        className={`${styles.noteItem} ${(focusedNoteId === note.id && pathname.startsWith('/notes/')) ? styles.active : ''} `}
                                        onClick={() => handleNoteClick(note.id)}
                                    >
                                        <FileText size={16} className={styles.icon} />
                                        <span style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            flex: 1,
                                            minWidth: 0
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
                                ))
                            )}
                        </div>
                    </>
                )}

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

                <div style={{ flex: 1 }}></div>

                {user ? (
                    <div className={styles.authSection}>
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                <User size={14} />
                            </div>
                            <span className={styles.userEmail}>{user.email?.split('@')[0]}</span>
                        </div>
                        <div className={styles.noteItem} onClick={() => signOut()}>
                            <LogOut size={16} className={styles.icon} />
                            <span>로그아웃 (Logout)</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles.noteItem} onClick={() => router.push('/login')}>
                        <LogIn size={16} className={styles.icon} />
                        <span>로그인 (Login)</span>
                    </div>
                )}

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
            </aside >
        </>
    );
}
