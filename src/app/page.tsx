import { createClient } from "@supabase/supabase-js";
import NoteInitializer from "@/components/providers/NoteInitializer";
import { Note } from "@/store/useNoteStore";
import { useMemo } from "react";
import Link from "next/link";

// Initialize Supabase Client for Server Side Data Fetching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

async function getNotes() {
  const { data } = await supabaseServer
    .from('notes')
    .select('*')
    .is('deleted_at', null)
    .order('z_index', { ascending: true });

  if (!data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((n: any) => ({
    id: n.id,
    x: n.x,
    y: n.y,
    title: n.title,
    content: n.content,
    createdAt: n.created_at ? Number(n.created_at) : 0,
    zIndex: n.z_index,
    deletedAt: n.deleted_at ? Number(n.deleted_at) : null,
    isPublished: n.is_published || false,
    userId: n.user_id || null,
  }));
}

export default async function Home() {
  const notes = await getNotes();
  const publishedNotes = notes.filter(note => note.isPublished);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '48px 24px', background: 'var(--bg-secondary)', scrollbarGutter: 'stable' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--text-primary)' }}>
          게시된 글 (Published)
        </h1>

        {publishedNotes.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: 100 }}>
            <p>아직 게시된 글이 없습니다.</p>
            <p style={{ fontSize: '0.9rem', marginTop: 8 }}>개인 페이지에서 &apos;게시하기&apos; 버튼을 눌러보세요.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {publishedNotes.map(note => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    borderRadius: 12,
                    padding: 24,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    border: '1px solid var(--border-primary)',
                    height: 280,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  className="home-note-card"
                >
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: 12,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {note.title || '제목 없음'}
                  </h2>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div
                      className="line-clamp-4"
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                      }}
                    >
                      {note.content?.replace(/<[^>]+>/g, '') || '내용 없음'}
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
