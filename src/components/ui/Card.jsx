import React from 'react'

const Card = ({ children, className = '', title, action }) => {
    return (
        <div className={`glass-panel ${className}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(title || action) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    {title && <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div>
                {children}
            </div>
        </div>
    )
}

export default Card
