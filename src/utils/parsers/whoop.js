export const parseWhoop = (csvContent) => {
    const lines = csvContent.split('\n')
    const data = []

    // Whoop usually has headers. We'll look for specific columns.
    // We assume the first line is header for simplicity in this MVP.

    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))

    // Indices
    const idxDate = header.findIndex(h => h.includes('Cycle Start') || h.includes('Date'))
    const idxRecovery = header.findIndex(h => h.includes('Recovery score'))
    const idxRHR = header.findIndex(h => h.includes('Resting Heart Rate'))
    const idxSleep = header.findIndex(h => h.includes('Sleep Performance'))

    lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return
        const parts = line.split(',')

        if (idxDate === -1) return

        const dateStr = parts[idxDate]?.replace(/"/g, '')
        if (!dateStr) return

        data.push({
            id: `wp_${index}`,
            source: 'Whoop',
            date: new Date(dateStr).toISOString(),
            timestamp: new Date(dateStr).getTime(),
            metrics: {
                recovery: parseFloat(parts[idxRecovery] || 0),
                rhr: parseFloat(parts[idxRHR] || 0),
                sleep: parseFloat(parts[idxSleep] || 0)
            }
        })
    })

    return data
}
