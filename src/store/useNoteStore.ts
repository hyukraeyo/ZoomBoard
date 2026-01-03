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
}

interface NoteState {
    notes: Note[];
    isLoading: boolean;
    fetchNotes: () => Promise<void>;
    addNote: (x: number, y: number) => Promise<void>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    bringToFront: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
    notes: [],
    isLoading: false,

    fetchNotes: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('z_index', { ascending: true }); // Ensure correct layering order

        if (error) {
            console.error('Error fetching notes:', error);
            set({ isLoading: false });
            return;
        }

        const formattedNotes: Note[] = (data || []).map((n: any) => ({
            id: n.id,
            x: n.x,
            y: n.y,
            title: n.title,
            content: n.content,
            createdAt: Number(n.created_at),
            zIndex: n.z_index,
        }));

        set({ notes: formattedNotes, isLoading: false });
    },

    addNote: async (x, y) => {
        const state = get();
        const maxZ = state.notes.length > 0 ? Math.max(...state.notes.map(n => n.zIndex || 1)) : 1;
        const newNote: Note = {
            id: uuidv4(),
            x: x - 350,
            y: y - 100,
            title: '',
            content: '',
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
                created_at: newNote.createdAt,
                z_index: newNote.zIndex,
            });

        if (error) {
            console.error('Error adding note:', error);
            // Rollback could be added here
        }
    },

    updateNote: async (id, updates) => {
        // Optimistic Update
        set((state) => ({
            notes: state.notes.map(note =>
                note.id === id ? { ...note, ...updates } : note
            )
        }));

        // Convert updates to DB format
        const dbUpdates: any = {};
        if (updates.x !== undefined) dbUpdates.x = updates.x;
        if (updates.y !== undefined) dbUpdates.y = updates.y;
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.content !== undefined) dbUpdates.content = updates.content;
        if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
        if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;

        const { error } = await supabase
            .from('notes')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating note:', error);
        }
    },

    deleteNote: async (id) => {
        set((state) => ({
            notes: state.notes.filter(note => note.id !== id)
        }));

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting note:', error);
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
}));
