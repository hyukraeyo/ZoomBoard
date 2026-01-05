import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import ClientNotePage from "./ClientNotePage";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

async function getNote(id: string) {
    const { data } = await supabaseServer
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

    return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const note = await getNote(id);

    return {
        title: `${note?.title || '새 노트'} | ZoomBoard`,
        description: note?.content?.replace(/<[^>]+>/g, '').substring(0, 160) || "ZoomBoard note content",
        openGraph: {
            title: note?.title || '새 노트',
            description: note?.content?.replace(/<[^>]+>/g, '').substring(0, 160),
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: note?.title || '새 노트',
            description: note?.content?.replace(/<[^>]+>/g, '').substring(0, 160),
        }
    };
}

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const note = await getNote(id);

    if (!note || note.deleted_at) {
        return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', color: 'var(--text-secondary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ marginBottom: 8 }}>존재하지 않거나 삭제된 페이지입니다.</h2>
                </div>
            </div>
        );
    }

    // Pass data to client component for interactive editing and auth checks
    return <ClientNotePage initialNote={note} id={id} />;
}
