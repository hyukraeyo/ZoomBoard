import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';
import { useNoteStore } from './useNoteStore';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    hasInitialized: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    hasInitialized: false,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user ?? null }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
        // Clear notes when signing out
        useNoteStore.getState().setNotes([]);
        useNoteStore.getState().setIsInitialized(false);
    },
    initialize: async () => {
        if (get().hasInitialized) return;

        set({ isLoading: true });

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user ?? null, isLoading: false, hasInitialized: true });

        // Listen for changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null, isLoading: false });
        });
    },
}));
