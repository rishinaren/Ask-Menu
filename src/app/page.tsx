'use client'

import { useState, useEffect } from 'react'
import Upload from './components/Upload'
import Ask from './components/Ask'
import SimpleRestaurantList from './components/SimpleRestaurantList'
import SetupGuide from '../components/SetupGuide'

export default function Home() {
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = (restaurantName: string) => {
    // Trigger a refresh of the restaurant list
    setRefreshKey(prev => prev + 1)
  }

  // Check if setup is needed by making a test API call
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'test', mode: 'single' })
        })
        const result = await response.json()
        if (result.error && result.error.includes('ANTHROPIC_API_KEY')) {
          setShowSetupGuide(true)
        }
      } catch (error) {
        // If there's an error, we'll assume setup might be needed
        console.log('Setup check failed, assuming setup needed')
        setShowSetupGuide(true)
      }
    }
    checkSetup()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="mb-6">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              Ask the Menu
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload menu images and discover answers about dishes, ingredients, and prices through intelligent conversation
          </p>
        </div>
        
        {/* Setup Guide - Show if API key is missing */}
        {showSetupGuide && (
          <div className="mb-12">
            <SetupGuide />
          </div>
        )}
        
        {/* Content Section */}
        <div className="space-y-8">
          <div className="space-y-8 animate-fade-in">
            <Upload onUploadSuccess={handleUploadSuccess} />
            <SimpleRestaurantList key={refreshKey} />
            <div className="flex justify-center">
              <div className="w-full max-w-2xl animate-slide-up">
                <Ask />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm">
            Powered by Claude AI • Built with Next.js & TypeScript
          </p>
        </div>
      </div>
    </main>
  )
}