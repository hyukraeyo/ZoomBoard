import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user ?? null }),
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
    initialize: async () => {
        set({ isLoading: true });

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        set({ session, user: session?.user ?? null, isLoading: false });

        // Listen for changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user ?? null, isLoading: false });
        });
    },
}));
