import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    fullWidth?: boolean;
}

export default function Button({ 
    children, 
    variant = 'primary', 
    fullWidth = false,
    style,
    ...props 
}: ButtonProps) {
    const baseStyle: React.CSSProperties = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'opacity 0.2s',
        ...(fullWidth && { width: '100%' }),
        ...style
    };

    const variantStyles: Record<'primary' | 'secondary', React.CSSProperties> = {
        primary: {
            background: 'var(--accent-primary)',
            color: 'white',
        },
        secondary: {
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
        }
    };

    return (
        <button
            style={{
                ...baseStyle,
                ...variantStyles[variant],
            }}
            onMouseOver={(e) => {
                if (variant === 'primary') {
                    e.currentTarget.style.opacity = '0.9';
                }
            }}
            onMouseOut={(e) => {
                if (variant === 'primary') {
                    e.currentTarget.style.opacity = '1';
                }
            }}
            {...props}
        >
            {children}
        </button>
    );
}
