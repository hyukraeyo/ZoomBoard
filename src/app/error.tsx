'use client';

const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

import { useEffect } from 'react';
import Button from '@/components/common/Button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        if (isDev) {
            console.error(error);
        }
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
                <Button onClick={() => reset()} variant="primary">
                    다시 시도
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="secondary">
                    홈으로 이동
                </Button>
            </div>
        </div>
    );
}
