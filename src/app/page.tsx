'use client'

import { useState, useEffect } from 'react'
import Upload from '@/app/components/UploadFixed'
import Chat from '@/app/components/Chat'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [restaurants, setRestaurants] = useState<Array<{id: number, name: string}>>([])
  const [showUpload, setShowUpload] = useState(true)

  // Fetch restaurants when component mounts or refreshes
  useEffect(() => {
    fetchRestaurants()
  }, [refreshKey])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants')
      if (response.ok) {
        const data = await response.json()
        setRestaurants(data.restaurants || [])
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const handleUploadSuccess = (restaurantId: string, restaurantName: string) => {
    console.log('Upload success:', { restaurantId, restaurantName })
    setRefreshKey(prev => prev + 1)
    setShowUpload(false) // Hide upload form after successful upload
  }

  const handleAddAnother = () => {
    setShowUpload(true) // Show upload form again
    setRefreshKey(prev => prev + 1) // Refresh to show new restaurant in chat
  }

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all restaurant data? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/clear', {
          method: 'POST',
        })
        
        if (response.ok) {
          setRestaurants([])
          setShowUpload(true)
          setRefreshKey(prev => prev + 1)
          alert('All restaurant data has been cleared successfully!')
        } else {
          alert('Failed to clear data. Please try again.')
        }
      } catch (error) {
        console.error('Error clearing data:', error)
        alert('Failed to clear data. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold text-slate-800 mb-4 tracking-tight">
            Ask The Menu
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload restaurant menus and ask questions about food, prices, and ingredients using AI
          </p>
          
          {/* Clear Data Button - only show if there are restaurants */}
          {restaurants.length > 0 && (
            <div className="mt-6">
              <button
                onClick={handleClearData}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                🗑️ Clear All Data
              </button>
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="space-y-12">
          {/* Upload Section */}
          {showUpload && (
            <div className="space-y-8 animate-fade-in">
              <Upload 
                onUploadSuccess={handleUploadSuccess} 
                onAddAnother={handleAddAnother}
              />
              
              <div className="text-center py-8">
                <p className="text-slate-500">
                  Upload menu images using drag & drop, file selection, or paste from clipboard (Ctrl+V)
                </p>
              </div>
            </div>
          )}

          {/* Add Another Restaurant Button - shown when upload form is hidden */}
          {!showUpload && restaurants.length > 0 && (
            <div className="text-center animate-fade-in">
              <button
                onClick={handleAddAnother}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✨ Add Another Restaurant
              </button>
            </div>
          )}

          {/* Chat Section */}
          <div className="animate-fade-in">
            <Chat restaurants={restaurants} />
          </div>
        </div>
      </div>
    </div>
  )
}