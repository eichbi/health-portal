export const parseLibre = (csvContent) => {
    const lines = csvContent.split('\n')
    const data = []

    // LibreView export
    // Device Timestamp, Record Type, Historic Glucose mmol/L, Scan Glucose mmol/L
    // Usually skip first few lines of metadata

    let headerFound = false
    let idxTime = -1
    let idxType = -1
    let idxHistoric = -1
    let idxScan = -1

    lines.forEach((line, index) => {
        if (!line.trim()) return
        const parts = line.split(',').map(p => p.trim().replace(/"/g, ''))

        if (!headerFound) {
            if (parts.includes('Device Timestamp') || parts.includes('Meter Timestamp')) {
                headerFound = true
                idxTime = parts.findIndex(p => p.includes('Timestamp'))
                idxType = parts.findIndex(p => p === 'Record Type')
                idxHistoric = parts.findIndex(p => p.includes('Historic Glucose'))
                idxScan = parts.findIndex(p => p.includes('Scan Glucose'))
            }
            return
        }

        const type = idxType > -1 ? parts[idxType] : '0' // 0 is usually auto-measurement

        // We construct a single value logic: prioritize Historic (auto) over Scan
        let glucose = null
        if (idxHistoric > -1 && parts[idxHistoric]) glucose = parts[idxHistoric]
        else if (idxScan > -1 && parts[idxScan]) glucose = parts[idxScan]

        if (glucose) {
            data.push({
                id: `fl_${index}`,
                source: 'FreestyleLibre',
                type: 'Glucose',
                value: parseFloat(glucose),
                unit: 'mmol/L', // assuming this based on header check usually
                date: new Date(parts[idxTime]).toISOString(),
                timestamp: new Date(parts[idxTime]).getTime()
            })
        }
    })

    return data
}
