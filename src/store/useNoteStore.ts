import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
    id: string;
    x: number;
    y: number;
    title: string;
    content: string;
    createdAt: number;
    zIndex: number;
    deletedAt?: number | null;
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
}

import { persist, createJSONStorage } from 'zustand/middleware';

export const useNoteStore = create<NoteState>()(
    persist(
        (set, get) => ({
            notes: [],
            trashNotes: [],
            isLoading: false,
            isSidebarOpen: true,
            isLocked: true,

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
                    // DB stores bigint (milliseconds), so just convert to Number
                    createdAt: n.created_at ? Number(n.created_at) : Date.now(),
                    zIndex: n.z_index,
                    deletedAt: n.deleted_at ? Number(n.deleted_at) : null,
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
                }));

                set({ trashNotes: formattedTrash });
            },

            addNote: async (x, y) => {
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
                } = {};
                if (updates.x !== undefined) dbUpdates.x = updates.x;
                if (updates.y !== undefined) dbUpdates.y = updates.y;
                if (updates.title !== undefined) dbUpdates.title = updates.title;
                if (updates.content !== undefined) dbUpdates.content = updates.content;
                if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
                if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;

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
                set((state) => ({
                    trashNotes: state.trashNotes.filter(n => n.id !== id)
                }));

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


            setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
            setIsLocked: (isLocked) => set({ isLocked: isLocked }),
        }),
        {
            name: 'zoomboard-storage', // unique name
            partialize: (state) => ({
                isSidebarOpen: state.isSidebarOpen,
                isLocked: state.isLocked,

                // optionally persist focused note? user said "unconditionally", let's do it.
                focusedNoteId: state.focusedNoteId
            }),
        }
    )
);
