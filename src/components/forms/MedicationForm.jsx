import React, { useState } from 'react'
import Button from '../ui/Button'
import { storage } from '../../services/storage'

const MedicationForm = ({ onClose, onSave }) => {
    const [name, setName] = useState('')
    const [dosage, setDosage] = useState('')
    const [frequency, setFrequency] = useState('Daily')

    const handleSubmit = () => {
        if (!name) return

        const med = {
            id: `med_${Date.now()}`,
            name,
            dosage,
            frequency,
            active: true,
            startDate: new Date().toISOString()
        }

        // Save to storage
        const existing = storage.get('medications') || []
        const updated = [...existing, med]
        storage.set('medications', updated)

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
                <h3 style={{ marginTop: 0 }}>Add Medication</h3>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Vitamin D"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Dosage</label>
                    <input
                        type="text"
                        value={dosage}
                        onChange={e => setDosage(e.target.value)}
                        placeholder="e.g. 1000 IU"
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Frequency</label>
                    <select
                        value={frequency} onChange={e => setFrequency(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <option>Daily</option>
                        <option>Twice Daily</option>
                        <option>Weekly</option>
                        <option>As Needed</option>
                    </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </div>
            </div>
        </div>
    )
}

export default MedicationForm
