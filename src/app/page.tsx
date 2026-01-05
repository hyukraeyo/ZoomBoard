'use client';

import Sidebar from '@/components/layout/Sidebar';
import { useNoteStore } from '@/store/useNoteStore';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { notes, fetchNotes } = useNoteStore();
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const publishedNotes = useMemo(() => {
    return notes.filter(note => note.isPublished);
  }, [notes]);

  return (
    <main style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '48px 24px', background: 'var(--bg-secondary)' }}>
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
                <div
                  key={note.id}
                  onClick={() => router.push(`/notes/${note.id}`)}
                  style={{
                    background: 'var(--bg-primary)',
                    borderRadius: 12,
                    padding: 24,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid var(--border-primary)',
                    height: 200,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
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
                  <div style={{
                    flex: 1,
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {/* Simple text extraction for preview */}
                    {note.content?.replace(/<[^>]+>/g, '') || '내용 없음'}
                  </div>
                  <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
