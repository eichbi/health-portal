/**
 * Parses Apple Health Export CSV content
 * @param {string} csvContent 
 * @returns {Array} Array of parsed health records
 */
export const parseAppleHealth = (csvContent) => {
    const lines = csvContent.split('\n')
    const data = []

    // Standard Apple Health CSV Header usually:
    // type,sourceName,sourceVersion,device,unit,creationDate,startDate,endDate,value

    let isBody = false

    lines.forEach((line, index) => {
        // Skip empty lines
        if (!line.trim()) return

        const parts = line.split(',')

        // Detect header (simplified)
        if (parts[0] === 'type' || parts[0] === '"type"') {
            isBody = true
            return
        }

        if (!isBody) return // Skip metadata at top if any

        // Clean up quotes
        const type = parts[0]?.replace(/"/g, '')
        const unit = parts[4]?.replace(/"/g, '')
        const date = parts[6]?.replace(/"/g, '')
        const value = parts[8]?.replace(/"/g, '')

        // Extract relevant metrics
        if (type && (type.includes('BodyMass') || type.includes('HeartRate') || type.includes('StepCount'))) {
            data.push({
                id: `ah_${index}`,
                source: 'AppleHealth',
                type: type.replace('HKQuantityTypeIdentifier', ''),
                value: parseFloat(value),
                unit: unit,
                date: new Date(date).toISOString(),
                timestamp: new Date(date).getTime()
            })
        }
    })

    return data
}
