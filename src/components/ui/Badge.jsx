import React from 'react'

const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: { bg: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' },
        success: { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399' },
        warning: { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' },
        accent: { bg: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' },
        gold: { bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid #fbbf24' }
    }

    const style = variants[variant] || variants.default

    return (
        <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            ...style
        }}>
            {children}
        </span>
    )
}

export default Badge
