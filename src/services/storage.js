const STORAGE_PREFIX = 'health_portal_'

export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(STORAGE_PREFIX + key)
            return item ? JSON.parse(item) : defaultValue
        } catch (e) {
            console.error('Error reading from storage', e)
            return defaultValue
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
        } catch (e) {
            console.error('Error writing to storage', e)
        }
    },

    remove: (key) => {
        localStorage.removeItem(STORAGE_PREFIX + key)
    },

    // Get all data for backup
    exportAll: () => {
        const backup = {}
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                const cleanKey = key.replace(STORAGE_PREFIX, '')
                backup[cleanKey] = storage.get(cleanKey)
            }
        })
        return JSON.stringify(backup, null, 2)
    },

    // Import data from backup
    importAll: (jsonString) => {
        try {
            const data = JSON.parse(jsonString)
            Object.keys(data).forEach(key => {
                storage.set(key, data[key])
            })
            return true
        } catch (e) {
            console.error('Import failed', e)
            return false
        }
    }
}
