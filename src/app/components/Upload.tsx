'use client'

import { useState } from 'react'
import { createWorker } from 'tesseract.js'

interface UploadProps {
  onUploadSuccess: (restaurantName: string) => void
}

export default function Upload({ onUploadSuccess }: UploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [restaurantName, setRestaurantName] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const processImage = async () => {
    if (!file || !restaurantName.trim()) {
      alert('Please select an image and enter a restaurant name')
      return
    }

    setIsProcessing(true)
    setProgress('Initializing OCR...')

    try {
      // Create Tesseract worker
      const worker = await createWorker()
      
      setProgress('Processing image...')
      const { data: { text } } = await worker.recognize(file)
      
      setProgress('Uploading to server...')
      
      // Send to upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          menuText: text,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const result = await response.json()
      setProgress('Upload successful!')
      onUploadSuccess(restaurantName)
      
      // Reset form
      setFile(null)
      setRestaurantName('')
      
      await worker.terminate()
    } catch (error) {
      console.error('Upload error:', error)
      setProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload Menu</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="restaurant-name" className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant Name
          </label>
          <input
            id="restaurant-name"
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Enter restaurant name"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label htmlFor="menu-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Menu Image
          </label>
          <input
            id="menu-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isProcessing}
          />
        </div>

        <button
          onClick={processImage}
          disabled={!file || !restaurantName.trim() || isProcessing}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Upload Menu'}
        </button>

        {progress && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">{progress}</p>
          </div>
        )}
      </div>
    </div>
  )
}
