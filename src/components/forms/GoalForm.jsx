import React, { useState } from 'react'
import Button from '../ui/Button'

const GoalForm = ({ goal, onClose, onSave }) => {
    const [target, setTarget] = useState(goal.target)

    const handleSubmit = () => {
        if (!target) return
        onSave({ ...goal, target: parseFloat(target) })
        onClose()
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{ padding: '2rem', width: '300px', background: '#1e293b' }}>
                <h3 style={{ marginTop: 0 }}>Edit {goal.label}</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Target ({goal.unit})
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={target}
                        onChange={e => setTarget(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Update</Button>
                </div>
            </div>
        </div>
    )
}

export default GoalForm
