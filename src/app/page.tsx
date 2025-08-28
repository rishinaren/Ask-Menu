'use client'

import { useState } from 'react'
import Upload from './components/Upload'
import Ask from './components/Ask'
import RestaurantList from './components/RestaurantList'

export default function Home() {
  const [mode, setMode] = useState<'single' | 'multi'>('single')
  const [uploadedMenu, setUploadedMenu] = useState<string | null>(null)

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
        
        {/* Mode Toggle */}
        <div className="flex justify-center mb-12 animate-slide-up">
          <div className="glass-card p-2 rounded-2xl">
            <div className="flex gap-1">
              <button
                onClick={() => setMode('single')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  mode === 'single'
                    ? 'mode-toggle-active'
                    : 'mode-toggle-inactive'
                }`}
              >
                Single Menu
              </button>
              <button
                onClick={() => setMode('multi')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  mode === 'multi'
                    ? 'mode-toggle-active'
                    : 'mode-toggle-inactive'
                }`}
              >
                Multi-Restaurant
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          {mode === 'single' ? (
            <div className="space-y-8 animate-fade-in">
              <Upload onUploadSuccess={setUploadedMenu} />
              {uploadedMenu && (
                <div className="animate-slide-up">
                  <Ask mode="single" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <Upload onUploadSuccess={() => window.location.reload()} />
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="animate-slide-up">
                  <RestaurantList />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <Ask mode="multi" />
                </div>
              </div>
            </div>
          )}
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