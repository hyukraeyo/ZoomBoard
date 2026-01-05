import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from './useAuthStore';

export interface Note {
    id: string;
    x: number;
    y: number;
    title: string;
    content: string;
    createdAt: number;
    zIndex: number;
    deletedAt?: number | null;
    isPublished?: boolean;
    userId?: string | null;
}

interface DBNote {
    id: string;
    x: number;
    y: number;
    title: string;
    content: string;
    created_at: number;
    z_index: number;
    deleted_at: number | null;
    is_published?: boolean;
    user_id?: string | null;
}

interface NoteState {
    notes: Note[];
    trashNotes: Note[];
    isLoading: boolean;
    fetchNotes: () => Promise<void>;
    fetchTrashNotes: () => Promise<void>;
    addNote: (x: number, y: number) => Promise<string>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>; // Soft delete
    restoreNote: (id: string) => Promise<void>;
    permanentlyDeleteNote: (id: string) => Promise<void>;
    bringToFront: (id: string) => Promise<void>;
    focusedNoteId: string | null;
    setFocusedNoteId: (id: string | null) => void;

    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    isLocked: boolean;
    setIsLocked: (isLocked: boolean) => void;
    setNotes: (notes: Note[]) => void;
    isInitialized: boolean;
    setIsInitialized: (isInitialized: boolean) => void;
}

import { persist } from 'zustand/middleware';

export const useNoteStore = create<NoteState>()(
    persist(
        (set, get) => ({
            notes: [],
            trashNotes: [],
            isLoading: false,
            isSidebarOpen: true,
            isLocked: true,
            isInitialized: false,
            setNotes: (notes) => set({ notes }),
            setIsInitialized: (val) => set({ isInitialized: val }),

            fetchNotes: async () => {
                set({ isLoading: true });
                const { data, error } = await supabase
                    .from('notes')
                    .select('*')
                    .is('deleted_at', null)
                    .order('z_index', { ascending: true }); // Ensure correct layering order

                if (error) {
                    console.error('Error fetching notes:', JSON.stringify(error, null, 2));
                    set({ isLoading: false });
                    return;
                }

                const formattedNotes: Note[] = (data || []).map((n: DBNote) => ({
                    id: n.id,
                    x: n.x,
                    y: n.y,
                    title: n.title,
                    content: n.content,
                    createdAt: n.created_at ? Number(n.created_at) : Date.now(),
                    zIndex: n.z_index,
                    deletedAt: n.deleted_at ? Number(n.deleted_at) : null,
                    isPublished: n.is_published || false,
                    userId: n.user_id || null,
                }));

                set({ notes: formattedNotes, isLoading: false });
            },

            fetchTrashNotes: async () => {
                const { data, error } = await supabase
                    .from('notes')
                    .select('*')
                    .not('deleted_at', 'is', null)
                    .order('deleted_at', { ascending: false });

                if (error) {
                    console.error('Error fetching trash:', JSON.stringify(error, null, 2));
                    return;
                }

                const formattedTrash: Note[] = (data || []).map((n: DBNote) => ({
                    id: n.id,
                    x: n.x,
                    y: n.y,
                    title: n.title,
                    content: n.content,
                    createdAt: n.created_at ? Number(n.created_at) : Date.now(),
                    zIndex: n.z_index,
                    deletedAt: n.deleted_at ? Number(n.deleted_at) : null,
                    userId: n.user_id || null,
                }));

                set({ trashNotes: formattedTrash });
            },

            addNote: async (x, y) => {
                const { user } = useAuthStore.getState();
                const userId = user?.id || null;
                const state = get();
                const maxZ = state.notes.length > 0 ? Math.max(...state.notes.map(n => n.zIndex || 1)) : 1;
                const newNote: Note = {
                    id: uuidv4(),
                    x: x - 350,
                    y: y - 100,
                    title: '',
                    content: '<h1></h1>',
                    createdAt: Date.now(),
                    zIndex: maxZ + 1,
                    userId,
                };

                // Optimistic Update
                set((state) => ({
                    notes: [...state.notes, newNote]
                }));

                const { error } = await supabase
                    .from('notes')
                    .insert({
                        id: newNote.id,
                        x: newNote.x,
                        y: newNote.y,
                        title: newNote.title,
                        content: newNote.content,
                        created_at: newNote.createdAt, // Send number, DB is bigint
                        z_index: newNote.zIndex,
                        user_id: userId,
                    });

                if (error) {
                    console.error('Error adding note:', JSON.stringify(error, null, 2));
                    // Rollback could be added here
                }

                return newNote.id;
            },

            updateNote: async (id, updates) => {
                // Optimistic Update
                set((state) => ({
                    notes: state.notes.map(note =>
                        note.id === id ? { ...note, ...updates } : note
                    )
                }));

                // Convert updates to DB format
                const dbUpdates: {
                    x?: number;
                    y?: number;
                    title?: string;
                    content?: string;
                    created_at?: number;
                    z_index?: number;
                    deleted_at?: number | null;
                    is_published?: boolean;
                } = {};
                if (updates.x !== undefined) dbUpdates.x = updates.x;
                if (updates.y !== undefined) dbUpdates.y = updates.y;
                if (updates.title !== undefined) dbUpdates.title = updates.title;
                if (updates.content !== undefined) dbUpdates.content = updates.content;
                if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
                if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;
                if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;

                if (Object.keys(dbUpdates).length === 0) return;

                const { error } = await supabase
                    .from('notes')
                    .update(dbUpdates)
                    .eq('id', id);

                if (error) {
                    console.error('Error updating note:', JSON.stringify(error, null, 2));
                    console.error('Failed ID:', id);
                    console.error('Failed Updates:', dbUpdates);
                }
            },

            deleteNote: async (id) => {
                // Soft Delete
                const now = Date.now();
                const noteToDelete = get().notes.find(n => n.id === id);

                set((state) => ({
                    notes: state.notes.filter(note => note.id !== id),
                    trashNotes: noteToDelete ? [{ ...noteToDelete, deletedAt: now }, ...state.trashNotes] : state.trashNotes
                }));

                const { error } = await supabase
                    .from('notes')
                    .update({ deleted_at: now })
                    .eq('id', id);

                if (error) {
                    console.error('Error soft deleting note:', JSON.stringify(error, null, 2));
                }
            },

            restoreNote: async (id) => {
                const noteToRestore = get().trashNotes.find(n => n.id === id);

                set((state) => ({
                    trashNotes: state.trashNotes.filter(n => n.id !== id),
                    notes: noteToRestore ? [...state.notes, { ...noteToRestore, deletedAt: null }] : state.notes
                }));

                const { error } = await supabase
                    .from('notes')
                    .update({ deleted_at: null })
                    .eq('id', id);

                if (error) {
                    console.error('Error restoring note:', JSON.stringify(error, null, 2));
                }
            },

            permanentlyDeleteNote: async (id) => {
                const noteToDelete = get().trashNotes.find(n => n.id === id);

                set((state) => ({
                    trashNotes: state.trashNotes.filter(n => n.id !== id)
                }));

                // 1. Find and delete associated images from Storage
                if (noteToDelete && noteToDelete.content) {
                    // Simple regex to extract image URLs from HTML content
                    const imgRegex = /<img[^>]+src="([^">]+)"/g;
                    let match;
                    const filesToDelete: string[] = [];

                    while ((match = imgRegex.exec(noteToDelete.content)) !== null) {
                        const url = match[1];
                        // Check if it's a Supabase Storage URL
                        if (url.includes('/storage/v1/object/public/images/')) {
                            // Extract filename (e.g., "GUID.png")
                            const fileName = url.split('/').pop();
                            if (fileName) {
                                filesToDelete.push(fileName);
                            }
                        }
                    }

                    if (filesToDelete.length > 0) {
                        const { error: storageError } = await supabase.storage
                            .from('images')
                            .remove(filesToDelete); // Bulk delete

                        if (storageError) {
                            console.error('Error deleting note images:', storageError);
                        } else {
                            console.log(`Deleted ${filesToDelete.length} images associated with note ${id}`);
                        }
                    }
                }

                // 2. Delete Note from DB
                const { error } = await supabase
                    .from('notes')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error permanently deleting note:', JSON.stringify(error, null, 2));
                }
            },

            bringToFront: async (id) => {
                const state = get();
                const maxZ = state.notes.length > 0 ? Math.max(...state.notes.map(n => n.zIndex || 1)) : 1;
                const targetNote = state.notes.find(n => n.id === id);

                if (targetNote && targetNote.zIndex === maxZ) return;

                const newZIndex = maxZ + 1;

                set((state) => ({
                    notes: state.notes.map(note =>
                        note.id === id ? { ...note, zIndex: newZIndex } : note
                    )
                }));

                const { error } = await supabase
                    .from('notes')
                    .update({ z_index: newZIndex })
                    .eq('id', id);

                if (error) {
                    console.error('Error bringing to front:', error);
                }
            },

            focusedNoteId: null,
            setFocusedNoteId: (id) => set({ focusedNoteId: id }),


            setIsSidebarOpen: (isOpen) => {
                set({ isSidebarOpen: isOpen });
                document.cookie = `sidebar_open=${isOpen}; path=/; max-age=31536000`; // 1 year
            },
            setIsLocked: (isLocked) => {
                set({ isLocked: isLocked });
                document.cookie = `sidebar_locked=${isLocked}; path=/; max-age=31536000`; // 1 year
            },
        }),
        {
            name: 'zoomboard-storage', // unique name
            partialize: (state) => ({
                isSidebarOpen: state.isSidebarOpen,
                isLocked: state.isLocked,
                // focusedNoteId is NOT persisted to avoid flashing old title on reload
            }),
        }
    )
);
