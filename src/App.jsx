import { useState, useEffect } from 'react'
import Card from './components/ui/Card'
import Button from './components/ui/Button'
import ImportModal from './components/ui/ImportModal'
import VitalsForm from './components/forms/VitalsForm'
import MedicationForm from './components/forms/MedicationForm'
import GoalForm from './components/forms/GoalForm'
import Chart from './components/charts/Chart'
import ProgressBar from './components/ui/ProgressBar'
import Badge from './components/ui/Badge'
import OnboardingModal from './components/ui/OnboardingModal'
import { storage } from './services/storage'
import { checkGoalStatus, defaultGoals } from './features/goals/logic'
import { calculateLevel, calculateProgressToNextLevel } from './features/gamification/logic'

function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [showImport, setShowImport] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [userProfile, setUserProfile] = useState(null)
    const [showVitalsForm, setShowVitalsForm] = useState(false)
    const [showMedForm, setShowMedForm] = useState(false)
    const [editingGoal, setEditingGoal] = useState(null)

    const [data, setData] = useState([])
    const [stats, setStats] = useState({ weight: '--', sleep: '--', steps: '--', hr: '--' })
    const [chartData, setChartData] = useState({ weight: [], sleep: [], steps: [], hr: [] })
    const [goals, setGoals] = useState(defaultGoals)
    const [achievements, setAchievements] = useState([])
    const [medications, setMedications] = useState([])

    const loadData = () => {
        const profile = storage.get('user_profile')
        if (!profile) {
            setShowOnboarding(true)
        } else {
            setUserProfile(profile)
            setShowOnboarding(false)
        }

        const stored = storage.get('health_data') || []
        const meds = storage.get('medications') || []
        const userGoals = storage.get('user_goals') || {}

        setMedications(meds)
        const sorted = [...stored].sort((a, b) => new Date(a.date) - new Date(b.date))
        setData(sorted)

        // --- Data Processing ---

        // Weight
        const weights = sorted
            .filter(d => (d.type === 'BodyMass' || d.type === 'weight') && d.value)
            .map(d => ({ date: d.date, value: parseFloat(d.value).toFixed(1), unit: 'kg' }))

        // Sleep
        const sleeps = sorted
            .filter(d => (d.source === 'Whoop' && d.metrics?.sleep) || d.type === 'Sleep')
            .map(d => ({ date: d.date, value: d.metrics?.sleep || d.value, unit: 'hrs' }))

        // Steps
        const steps = sorted
            .filter(d => d.type === 'StepCount')
            .map(d => ({ date: d.date, value: d.value, unit: 'steps' }))

        // Heart Rate (RHR)
        const hrs = sorted
            .filter(d => d.type === 'HeartRate' || (d.source === 'Whoop' && d.metrics?.rhr))
            .map(d => ({ date: d.date, value: d.metrics?.rhr || d.value, unit: 'bpm' }))

        setChartData({ weight: weights, sleep: sleeps, steps: steps, hr: hrs })

        // Latest Stats
        const latestWeight = weights.length ? parseFloat(weights[weights.length - 1].value) : null
        const latestSleep = sleeps.length ? parseFloat(sleeps[sleeps.length - 1].value) : null
        const latestSteps = steps.length ? parseInt(steps[steps.length - 1].value) : null
        const latestHR = hrs.length ? parseInt(hrs[hrs.length - 1].value) : null

        setStats({
            weight: latestWeight || '--',
            sleep: latestSleep || '--',
            steps: latestSteps || '--',
            hr: latestHR || '--'
        })

        // --- Goals Logic ---
        // Merge defaults with user prefs
        const mergedGoals = defaultGoals.map(g => {
            const userTarget = userGoals[g.id]
            return userTarget ? { ...g, target: userTarget } : g
        })

        const updatedGoals = mergedGoals.map(g => {
            let current = 0
            if (g.type === 'weight') current = latestWeight || 0
            if (g.type === 'sleep') current = latestSleep || 0

            const { isMet, progress } = checkGoalStatus(g, current)
            return { ...g, current: current || '--', isMet, progress }
        })
        setGoals(updatedGoals)

        // --- Achievements ---
        const newAchievements = []
        if (stored.length > 0) newAchievements.push({ id: 'a1', label: 'First Step', variant: 'success' })
        if (sorted.length > 10) newAchievements.push({ id: 'a2', label: 'Consistent Tracker', variant: 'warning' })
        if (updatedGoals.some(g => g.isMet)) newAchievements.push({ id: 'a3', label: 'Goal Crusher', variant: 'gold' })
        if (meds.length > 0) newAchievements.push({ id: 'a4', label: 'Med Manager', variant: 'default' })
        if (latestSteps > 10000) newAchievements.push({ id: 'a5', label: '10k Steps', variant: 'success' })

        setAchievements(newAchievements)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleUpdateGoal = (updatedGoal) => {
        const userGoals = storage.get('user_goals') || {}
        userGoals[updatedGoal.id] = updatedGoal.target
        storage.set('user_goals', userGoals)
        loadData()
    }

    return (
        <div className="container">
            <header style={{ padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        {userProfile ? `Hola, ${userProfile.name}!` : 'HealthPortal'}
                    </h1>
                    {userProfile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <Badge variant="accent">Lvl {userProfile.level}</Badge>
                            <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                <div style={{
                                    width: `${calculateProgressToNextLevel(userProfile.xp)}%`,
                                    height: '100%',
                                    background: 'var(--accent)',
                                    borderRadius: '3px'
                                }} />
                            </div>
                        </div>
                    )}
                </div>
                <nav style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                    {['dashboard', 'vitals', 'goals', 'medications'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="glass-panel"
                            style={{
                                padding: '0.5rem 1rem',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: activeTab === tab ? '600' : '400',
                                background: activeTab === tab ? 'var(--glass-highlight)' : 'transparent',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </header>

            <main style={{ padding: '2rem 0' }}>
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Primary Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            <Card title="Weight Trend">
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.weight}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>kg</span>
                                </div>
                                <Chart data={chartData.weight} dataKey="value" color="#3b82f6" height={150} />
                            </Card>

                            <Card title="Sleep Quality">
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.sleep}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>hrs</span>
                                </div>
                                <Chart data={chartData.sleep} dataKey="value" color="#8b5cf6" height={150} />
                            </Card>

                            <Card title="Activity (Steps)">
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.steps}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>steps</span>
                                </div>
                                <Chart data={chartData.steps} dataKey="value" color="#f59e0b" height={150} />
                            </Card>

                            <Card title="Heart Rate">
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.hr}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>bpm</span>
                                </div>
                                <Chart data={chartData.hr} dataKey="value" color="#ef4444" height={150} />
                            </Card>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {achievements.length > 0 && (
                                <Card title="Achievements">
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {achievements.map(a => <Badge key={a.id} variant={a.variant}>{a.label}</Badge>)}
                                    </div>
                                </Card>
                            )}

                            <Card title="Quick Actions">
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <Button variant="primary" size="sm" onClick={() => setShowVitalsForm(true)}>Log Vitals</Button>
                                    <Button variant="secondary" size="sm" onClick={() => setShowMedForm(true)}>Add Medication</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setShowImport(true)}>Import CSV</Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'vitals' && (
                    <Card title="Vitals Log" action={<Button size="sm" onClick={() => setShowVitalsForm(true)}>Log New</Button>}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {data.slice().reverse().slice(0, 20).map((item, idx) => (
                                <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.type === 'BodyMass' ? 'Weight' : item.type}</span>
                                    <span style={{ fontWeight: 'bold' }}>{item.value} {item.unit}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(item.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                            {data.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No vitals recorded.</p>}
                        </div>
                    </Card>
                )}

                {activeTab === 'goals' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {goals.map(goal => (
                            <Card key={goal.id} title={goal.label} action={<Button size="sm" variant="ghost" onClick={() => setEditingGoal(goal)}>Edit</Button>}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Current: {goal.current} {goal.unit}</span>
                                        <span style={{ color: goal.isMet ? 'var(--success)' : 'var(--text-primary)' }}>Target: {goal.target} {goal.unit}</span>
                                    </div>
                                    <ProgressBar value={goal.progress} color={goal.isMet ? 'var(--success)' : 'var(--primary)'} />
                                </div>
                                {goal.isMet && <Badge variant="success">Goal Met!</Badge>}
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'medications' && (
                    <Card title="Medications" action={<Button size="sm" onClick={() => setShowMedForm(true)}>Add New</Button>}>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {medications.length > 0 ? medications.map((med, idx) => (
                                <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{med.name}</div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{med.dosage} • {med.frequency}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '2px', background: i < 3 ? 'var(--success)' : 'var(--glass-border)' }} />
                                            ))}
                                        </div>
                                        <Badge variant="success">Active</Badge>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No medications tracked.</p>
                            )}
                        </div>
                    </Card>
                )}
            </main>

            {showImport && <ImportModal onClose={() => setShowImport(false)} onImportComplete={loadData} />}
            {showOnboarding && <OnboardingModal onComplete={loadData} />}
            {showVitalsForm && <VitalsForm onClose={() => setShowVitalsForm(false)} onSave={loadData} />}
            {showMedForm && <MedicationForm onClose={() => setShowMedForm(false)} onSave={loadData} />}
            {editingGoal && <GoalForm goal={editingGoal} onClose={() => setEditingGoal(null)} onSave={handleUpdateGoal} />}
        </div>
    )
}

export default App
