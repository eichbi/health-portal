/**
 * Checks if a goal is met based on current value.
 * @param {object} goal - { type: 'weight', target: 75, operator: 'lte' }
 * @param {number} currentValue 
 * @returns {object} { isMet: boolean, progress: number (0-100) }
 */
export const checkGoalStatus = (goal, currentValue) => {
    if (currentValue === null || currentValue === undefined) return { isMet: false, progress: 0 }

    let isMet = false
    let progress = 0

    if (goal.operator === 'lte') { // Less than or equal (e.g. Weight)
        isMet = currentValue <= goal.target
        // simple progress calc: if start is unknown, we just assume 100% if met, else ratio
        // Ideally we need startValue to calc true progress bar, but for MVP:
        progress = isMet ? 100 : (goal.target / currentValue) * 100
    } else if (goal.operator === 'gte') { // Greater than or equal (e.g. Sleep)
        isMet = currentValue >= goal.target
        progress = isMet ? 100 : (currentValue / goal.target) * 100
    }

    return { isMet, progress: Math.min(Math.max(progress, 0), 100) }
}

export const defaultGoals = [
    { id: 'g_weight', type: 'weight', label: 'Target Weight', target: 70, operator: 'lte', unit: 'kg' },
    { id: 'g_sleep', type: 'sleep', label: 'Sleep Goal', target: 8, operator: 'gte', unit: 'hrs' }
]
