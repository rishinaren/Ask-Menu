'use client'

import { useState } from 'react'
import Upload from './components/Upload'
import Ask from './components/Ask'
import RestaurantList from './components/RestaurantList'

export default function Home() {
  const [mode, setMode] = useState<'single' | 'multi'>('single')
  const [uploadedMenu, setUploadedMenu] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Ask-the-Menu RAG
        </h1>
        
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'single'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Single Menu
            </button>
            <button
              onClick={() => setMode('multi')}
              className={`px-4 py-2 rounded-md transition-colors ${
                mode === 'multi'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Multi-Restaurant
            </button>
          </div>
        </div>

        {mode === 'single' ? (
          <div className="space-y-8">
            <Upload onUploadSuccess={setUploadedMenu} />
            {uploadedMenu && <Ask mode="single" />}
          </div>
        ) : (
          <div className="space-y-8">
            <Upload onUploadSuccess={() => window.location.reload()} />
            <RestaurantList />
            <Ask mode="multi" />
          </div>
        )}
      </div>
    </main>
  )
}