export default function Loading() {
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
            gap: '16px'
        }}>
            <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-primary)',
                borderTop: '4px solid var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>불러오는 중...</p>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
}
