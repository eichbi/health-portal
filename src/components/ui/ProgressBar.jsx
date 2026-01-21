import React from 'react'

const ProgressBar = ({ value, max = 100, color = 'var(--primary)', height = '8px' }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '999px',
            width: '100%',
            height: height,
            overflow: 'hidden'
        }}>
            <div style={{
                width: `${percentage}%`,
                height: '100%',
                background: color,
                borderRadius: '999px',
                transition: 'width 1s ease-in-out'
            }} />
        </div>
    )
}

export default ProgressBar
