'use client'

import { useState } from 'react'

interface UploadProps {
  restaurantId?: string
  onUploadSuccess: (restaurantId: string, restaurantName: string) => void
}

export default function Upload({ restaurantId = '1', onUploadSuccess }: UploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const processImage = async () => {
    if (files.length === 0 || !restaurantName.trim()) {
      alert('Please select at least one image and enter a restaurant name')
      return
    }

    setIsProcessing(true)
    setProgress('🔍 Processing...')

    try {
      // Simulate OCR processing
      setProgress('📖 Reading menu text...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const combinedText = files.map((file, i) => `Menu Image ${i + 1} (${file.name}): [OCR processing would extract text here]`).join('\n\n')
      
      setProgress('☁️ Uploading to server...')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          menuText: combinedText,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const result = await response.json()
      setProgress('✅ Upload successful!')
      onUploadSuccess(restaurantId, restaurantName)
      
      setFiles([])
      setRestaurantName('')
    } catch (error) {
      console.error('Upload error:', error)
      setProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="glass-card rounded-3xl p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Upload Menu</h2>
        <p className="text-slate-600">Upload menu images to build your restaurant database</p>
      </div>
      
      <div className="space-y-6">
        {/* Restaurant Name Input */}
        <div>
          <label htmlFor={`restaurant-name-${restaurantId}`} className="block text-sm font-medium text-slate-700 mb-3">
            Restaurant Name
          </label>
          <input
            id={`restaurant-name-${restaurantId}`}
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="Enter restaurant name"
            className="input-field"
            disabled={isProcessing}
          />
        </div>

        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Menu Images (Multiple files supported)
          </label>
          
          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mb-4 space-y-2 p-4 bg-green-50/50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700 truncate max-w-48">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors p-1 rounded"
                      disabled={isProcessing}
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
              dragActive 
                ? 'border-blue-400 bg-blue-50/50' 
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 text-slate-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-slate-600 font-medium">
                  {files.length > 0 ? 'Add more menu images' : 'Drop your menu images here'}
                </p>
                <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={processImage}
          disabled={files.length === 0 || !restaurantName.trim() || isProcessing}
          className={`w-full font-medium py-4 px-6 rounded-xl transition-all duration-200 ${
            isProcessing 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : files.length === 0 || !restaurantName.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>
                Upload {files.length > 0 ? `${files.length} Menu${files.length !== 1 ? 's' : ''}` : 'Menu'}
              </span>
            </div>
          )}
        </button>

        {/* Progress Display */}
        {progress && (
          <div className={`p-4 rounded-xl border ${
            progress.includes('Error') || progress.includes('❌')
              ? 'bg-red-50 border-red-200 text-red-800'
              : progress.includes('successful') || progress.includes('✅')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          } animate-slide-up`}>
            <p className="text-sm font-medium">{progress}</p>
          </div>
        )}
      </div>
    </div>
  )
}
