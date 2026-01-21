import React, { useState } from 'react'
import Button from './Button'
import { storage } from '../../services/storage'
import { defaultGoals } from '../../features/goals/logic'

const OnboardingModal = ({ onComplete }) => {
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [goals, setGoals] = useState(defaultGoals)

    const handleGoalChange = (id, value) => {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, target: value } : g))
    }

    const handleNext = () => {
        if (step === 1 && name.trim()) {
            setStep(2)
        } else if (step === 2) {
            handleComplete()
        }
    }

    const handleComplete = () => {
        // Save Profile
        const profile = {
            name,
            joined: new Date().toISOString(),
            xp: 0,
            level: 1
        }
        storage.set('user_profile', profile)

        // Save Goals
        const userGoals = {}
        goals.forEach(g => {
            userGoals[g.id] = g.target
        })
        storage.set('user_goals', userGoals)

        onComplete()
    }

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div className="glass-panel" style={{
                padding: '2.5rem',
                width: '400px',
                maxWidth: '90%',
                background: '#1e293b',
                border: '1px solid var(--oxxo-yellow)', // Oxxo accent
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--oxxo-red)' }}>
                    {step === 1 ? '¡Hola!' : 'Mis Metas'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {step === 1 ? 'Welcome to your personal health portal. What should we call you?' : 'Let\'s set some initial targets.'}
                </p>

                {step === 1 && (
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Tu Nombre"
                        autoFocus
                        style={{
                            width: '100%', padding: '1rem', fontSize: '1.2rem', marginBottom: '2rem',
                            borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                            color: 'white', border: '1px solid var(--glass-border)',
                            textAlign: 'center'
                        }}
                    />
                )}

                {step === 2 && (
                    <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                        {goals.map(g => (
                            <div key={g.id}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{g.label} ({g.unit})</label>
                                <input
                                    type="number"
                                    value={g.target}
                                    onChange={e => handleGoalChange(g.id, e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem', borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)', color: 'white',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    variant="primary"
                    size="lg"
                    style={{ width: '100%', background: 'var(--oxxo-red)', color: 'white' }}
                    onClick={handleNext}
                    disabled={step === 1 && !name.trim()}
                >
                    {step === 1 ? 'Continuar' : 'Comenzar'}
                </Button>
            </div>
        </div>
    )
}

export default OnboardingModal
