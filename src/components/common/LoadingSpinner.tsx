export default function LoadingSpinner() {
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
            gap: '8px'
        }}>
            <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
            }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    animation: 'bounce 1.4s ease-in-out infinite both',
                    animationDelay: '0s'
                }}></div>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    animation: 'bounce 1.4s ease-in-out infinite both',
                    animationDelay: '0.2s'
                }}></div>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    animation: 'bounce 1.4s ease-in-out infinite both',
                    animationDelay: '0.4s'
                }}></div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}} />
        </div>
    );
}
