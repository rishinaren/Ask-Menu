'use client'

import { useState } from 'react'
import Upload from './components/Upload'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = (restaurantId: string, restaurantName: string) => {
    console.log('Upload success:', { restaurantId, restaurantName })
    setRefreshKey(prev => prev + 1)
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
        </div>
        
        {/* Content Section */}
        <div className="space-y-8">
          <div className="space-y-8 animate-fade-in">
            <Upload onUploadSuccess={handleUploadSuccess} />
            
            <div className="text-center py-8">
              <p className="text-slate-500">
                Upload a menu image using drag & drop, file selection, or paste from clipboard (Ctrl+V)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
