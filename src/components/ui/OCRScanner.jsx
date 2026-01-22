import React, { useState } from 'react'
import Tesseract from 'tesseract.js'
import Button from './Button'

const OCRScanner = ({ onScanComplete, label = "Scan Value" }) => {
    const [scanning, setScanning] = useState(false)

    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setScanning(true)
        try {
            const result = await Tesseract.recognize(
                file,
                'eng', // English is usually sufficient for numbers
                { logger: m => console.log(m) }
            )

            const text = result.data.text
            console.log('OCR Output:', text)

            // Regex to find the first valid number (integer or decimal)
            const match = text.match(/[-+]?[0-9]*\.?[0-9]+/)
            if (match) {
                onScanComplete(match[0])
            } else {
                alert('No numbers found in image.')
            }
        } catch (err) {
            console.error(err)
            alert('Failed to scan image.')
        } finally {
            setScanning(false)
        }
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                id="ocr-upload"
                style={{ display: 'none' }}
                onChange={handleImageChange}
            />
            <label htmlFor="ocr-upload">
                <div
                    className="glass-panel"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        cursor: scanning ? 'wait' : 'pointer',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid var(--primary)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                    }}
                >
                    {scanning ? (
                        <span>Processing...</span>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                            {label}
                        </>
                    )}
                </div>
            </label>
        </div>
    )
}

export default OCRScanner
