import React, { useState } from 'react'
import Button from './Button'
import { parseAppleHealth } from '../../utils/parsers/appleHealth'
import { parseWhoop } from '../../utils/parsers/whoop'
import { parseLibre } from '../../utils/parsers/freestyleLibre'
import { storage } from '../../services/storage'

const ImportModal = ({ onClose, onImportComplete }) => {
    const [file, setFile] = useState(null)
    const [source, setSource] = useState('apple')
    const [status, setStatus] = useState('idle')

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0])
    }

    const handleImport = async () => {
        if (!file) return
        setStatus('processing')

        const reader = new FileReader()
        reader.onload = async (e) => {
            const content = e.target.result
            let data = []

            try {
                if (source === 'apple') data = parseAppleHealth(content)
                if (source === 'whoop') data = parseWhoop(content)
                if (source === 'libre') data = parseLibre(content)

                // Save to storage (merging logic simplified: just append/overwrite key)
                const existingStart = storage.get('health_data') || []
                // Simple merge: duplicate avoidance would be needed in production
                const merged = [...existingStart, ...data]
                storage.set('health_data', merged)

                setStatus('success')
                setTimeout(() => {
                    onImportComplete()
                    onClose()
                }, 1000)
            } catch (err) {
                console.error(err)
                setStatus('error')
            }
        }
        reader.readAsText(file)
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{ padding: '2rem', width: '400px', background: '#1e293b' }}>
                <h2 style={{ marginTop: 0 }}>Import Data</h2>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Source</label>
                    <select
                        value={source}
                        onChange={e => setSource(e.target.value)}
                        style={{
                            width: '100%', padding: '0.5rem', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <option value="apple">Apple Health (CSV)</option>
                        <option value="whoop">Whoop</option>
                        <option value="libre">Freestyle Libre</option>
                    </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CSV File</label>
                    <input type="file" accept=".csv" onChange={handleFileChange} style={{ color: 'white' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || status === 'processing'}>
                        {status === 'processing' ? 'Importing...' : status === 'success' ? 'Done!' : 'Import'}
                    </Button>
                </div>
                {status === 'error' && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>Error parsing file</p>}
            </div>
        </div>
    )
}

export default ImportModal
