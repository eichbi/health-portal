import React, { useState } from 'react'
import Button from '../ui/Button'
import { storage } from '../../services/storage'
import { XP_VALUES, calculateLevel } from '../../features/gamification/logic'

const VitalsForm = ({ onClose, onSave }) => {
    const [type, setType] = useState('weight')
    const [value, setValue] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    const handleSubmit = () => {
        if (!value) return

        const record = {
            id: `man_${Date.now()}`,
            source: 'Manual',
            type: type === 'weight' ? 'BodyMass' : type === 'sleep' ? 'Sleep' : type === 'heart_rate' ? 'HeartRate' : type === 'steps' ? 'StepCount' : 'Glucose',
            value: parseFloat(value),
            unit: type === 'weight' ? 'kg' : type === 'sleep' ? 'hrs' : type === 'heart_rate' ? 'bpm' : type === 'steps' ? 'count' : 'mg/dL',
            date: new Date(date).toISOString(),
            timestamp: new Date(date).getTime()
        }

        // Save to storage
        const existing = storage.get('health_data') || []
        const updated = [...existing, record]
        storage.set('health_data', updated)

        // Award XP
        const profile = storage.get('user_profile')
        if (profile) {
            const newXP = (profile.xp || 0) + XP_VALUES.LOG_VITALS
            const newLevel = calculateLevel(newXP)
            storage.set('user_profile', { ...profile, xp: newXP, level: newLevel })
        }

        onSave()
        onClose()
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{ padding: '2rem', width: '350px', background: '#1e293b' }}>
                <h3 style={{ marginTop: 0 }}>Log Vitals</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Type</label>
                    <select
                        value={type} onChange={e => setType(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <option value="weight">Weight (kg)</option>
                        <option value="sleep">Sleep (hrs)</option>
                        <option value="heart_rate">Heart Rate (bpm)</option>
                        <option value="steps">Steps</option>
                        <option value="glucose">Glucose (mg/dL)</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        Value {type === 'heart_rate' ? '(bpm)' : type === 'steps' ? '' : type === 'glucose' ? '(mg/dL)' : type === 'weight' ? '(kg)' : '(hrs)'}
                    </label>
                    <input
                        type="number"
                        step={type === 'steps' || type === 'heart_rate' ? '1' : '0.1'}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </div>
            </div>
        </div>
    )
}

export default VitalsForm
