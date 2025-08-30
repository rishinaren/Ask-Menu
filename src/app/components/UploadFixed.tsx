'use client'

import { useState, useEffect } from 'react'

interface UploadProps {
  restaurantId?: string
  onUploadSuccess: (restaurantId: string, restaurantName: string) => void
  onAddAnother?: () => void
}

function Upload({ restaurantId = '1', onUploadSuccess, onAddAnother }: UploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [pasteActive, setPasteActive] = useState(false)

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

  // Clipboard paste functionality
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      console.log('🔍 Paste event detected')
      
      // Allow paste everywhere except in text inputs (but allow in restaurant name)
      const activeElement = document.activeElement
      const isRestaurantNameInput = activeElement?.id === `restaurant-name-${restaurantId}`
      const isOtherTextInput = (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') && !isRestaurantNameInput
      
      if (isOtherTextInput) {
        console.log('❌ Paste ignored - in other text input')
        return
      }

      const items = e.clipboardData?.items
      if (!items) {
        console.log('❌ No clipboard items')
        return
      }

      console.log('📋 Clipboard items found:', items.length)
      
      let foundImage = false
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          foundImage = true
          setPasteActive(true)
          console.log('✅ Image found in clipboard:', item.type)
          
          const blob = item.getAsFile()
          if (blob) {
            console.log('✅ Got blob:', blob.type, blob.size, 'bytes')
            // Create a File object from the blob with a proper name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const extension = blob.type.split('/')[1] || 'png'
            const fileName = `pasted-image-${timestamp}.${extension}`
            
            const file = new File([blob], fileName, { type: blob.type })
            setFiles(prev => {
              console.log('✅ Adding pasted file to list:', fileName)
              return [...prev, file]
            })
            
            // Show success feedback
            setTimeout(() => setPasteActive(false), 3000)
          } else {
            console.log('❌ Failed to get blob from clipboard item')
          }
          break
        }
      }
      
      if (!foundImage) {
        console.log('❌ No image found in clipboard')
        // Show feedback that paste was attempted
        setPasteActive(true)
        setTimeout(() => setPasteActive(false), 2000)
      }
    }

    document.addEventListener('paste', handlePaste)
    
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [restaurantId])

  // Keyboard shortcut hint
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        console.log('✅ Ctrl+V detected - showing paste feedback')
        setPasteActive(true)
        setTimeout(() => setPasteActive(false), 2000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const processImage = async () => {
    if (files.length === 0 || !restaurantName.trim()) {
      alert('Please select at least one image and enter a restaurant name')
      return
    }

    setIsProcessing(true)
    setProgress('🔍 Initializing OCR...')

    try {
      // Dynamic import to avoid SSR issues
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker()
      let combinedText = ''
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress(`📖 Reading menu ${i + 1} of ${files.length}: ${file.name}`)
        const { data: { text } } = await worker.recognize(file)
        combinedText += `\n\n--- Menu Image ${i + 1} (${file.name}) ---\n${text}`
      }
      
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
      
      await worker.terminate()
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      {file.name.startsWith('pasted-image-') && (
                        <span className="text-purple-600 text-xs bg-purple-100 px-2 py-1 rounded-full">📋 clipboard</span>
                      )}
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
                : pasteActive
                ? 'border-purple-400 bg-purple-50/50'
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
              {pasteActive ? (
                <div className="flex flex-col items-center space-y-2 text-purple-600 animate-pulse">
                  <div className="w-16 h-16">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="font-medium">Paste detected! 📋</p>
                  <p className="text-sm text-purple-500 text-center">
                    Copy an image to your clipboard and press Ctrl+V (or Cmd+V)<br/>
                    Screenshots, copied images, and files all work!
                  </p>
                </div>
              ) : (
                <>
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
                    <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-slate-400">
                      <div className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-slate-100 rounded border text-slate-600">Ctrl</kbd>
                        <span>+</span>
                        <kbd className="px-2 py-1 bg-slate-100 rounded border text-slate-600">V</kbd>
                        <span>to paste images</span>
                      </div>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400">Try taking a screenshot!</span>
                    </div>
                  </div>
                </>
              )}
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
              : 'bg-blue-600 hover:bg-blue-700 text-white'
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
          }`}>
            <p className="text-sm font-medium">{progress}</p>
            {progress.includes('successful') && onAddAnother && (
              <button
                onClick={onAddAnother}
                className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ✨ Add Another Restaurant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Upload
