'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100vh',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '24px',
            textAlign: 'center'
        }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: 'bold' }}>문제가 발생했습니다.</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' }}>
                죄송합니다. 요청하신 작업을 처리하는 동안 오류가 발생했습니다.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    onClick={() => reset()}
                    style={{
                        padding: '10px 20px',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    다시 시도
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        padding: '10px 20px',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    홈으로 이동
                </button>
            </div>
        </div>
    );
}
