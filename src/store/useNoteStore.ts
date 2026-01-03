import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Simple ID generator to avoid external dependencies issues
const generateId = () => Math.random().toString(36).substr(2, 9);

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
    addNote: (x: number, y: number) => void;
    updateNote: (id: string, updates: Partial<Note>) => void;
    deleteNote: (id: string) => void;
    bringToFront: (id: string) => void;
}

export const useNoteStore = create<NoteState>()(
    persist(
        (set) => ({
            notes: [
                {
                    id: 'initial-note',
                    x: 1500 - 350,
                    y: 1500 - 200,
                    title: '',
                    content: '<p>Start typing here...</p>',
                    createdAt: Date.now(),
                    zIndex: 1,
                }
            ],
            addNote: (x, y) => set((state) => {
                const maxZ = state.notes.length > 0 ? Math.max(...state.notes.map(n => n.zIndex || 1)) : 1;
                return {
                    notes: [
                        ...state.notes,
                        {
                            id: generateId(),
                            x: x - 350,
                            y: y - 100,
                            title: '',
                            content: '',
                            createdAt: Date.now(),
                            zIndex: maxZ + 1,
                        }
                    ]
                };
            }),
            updateNote: (id, updates) => set((state) => ({
                notes: state.notes.map(note =>
                    note.id === id ? { ...note, ...updates } : note
                )
            })),
            deleteNote: (id) => set((state) => ({
                notes: state.notes.filter(note => note.id !== id)
            })),
            bringToFront: (id) => set((state) => {
                const maxZ = state.notes.length > 0 ? Math.max(...state.notes.map(n => n.zIndex || 1)) : 1;
                const targetNote = state.notes.find(n => n.id === id);
                // Minimize updates: only update if not already on top
                if (targetNote && targetNote.zIndex === maxZ) return { notes: state.notes };

                return {
                    notes: state.notes.map(note =>
                        note.id === id ? { ...note, zIndex: maxZ + 1 } : note
                    )
                };
            }),
        }),
        {
            name: 'expert-note-storage-v4', // Bump version for schema change
            storage: createJSONStorage(() => localStorage),
        }
    )
);
