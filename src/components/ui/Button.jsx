import React from 'react'

const Button = ({ children, onClick, variant = 'primary', className = '', size = 'md', ...props }) => {
    const baseStyle = {
        borderRadius: '8px',
        fontWeight: 600,
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: 'pointer'
    }

    const variants = {
        primary: { background: 'var(--primary)', color: '#ffffff', border: 'none' },
        secondary: { background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.2)' },
        ghost: { background: 'transparent', color: 'var(--text-secondary)', border: 'none' },
        danger: { background: 'var(--danger)', color: '#ffffff', border: 'none' }
    }

    const sizes = {
        sm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },
        md: { padding: '0.5rem 1rem', fontSize: '1rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' }
    }

    return (
        <button
            onClick={onClick}
            style={{ ...baseStyle, ...variants[variant], ...sizes[size] }}
            className={className}
            onMouseOver={(e) => {
                if (variant !== 'ghost') e.currentTarget.style.filter = 'brightness(1.1)'
                if (variant === 'ghost') e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseOut={(e) => {
                if (variant !== 'ghost') e.currentTarget.style.filter = 'none'
                if (variant === 'ghost') e.currentTarget.style.color = 'var(--text-secondary)'
            }}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
