interface EmptyStateProps {
    title: string;
    description?: string;
    fullHeight?: boolean;
}

export default function EmptyState({ title, description, fullHeight = false }: EmptyStateProps) {
    return (
        <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: fullHeight ? '100vh' : '100%',
            color: 'var(--text-secondary)'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ marginBottom: description ? 8 : 0, fontSize: '1.25rem', fontWeight: '600' }}>{title}</h2>
                {description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{description}</p>
                )}
            </div>
        </div>
    );
}
