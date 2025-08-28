'use client'

import { useState } from 'react'

interface AskProps {
  mode: 'single' | 'multi'
}

export default function Ask({ mode }: AskProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    setAnswer('')

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          mode,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const result = await response.json()
      setAnswer(result.answer)
    } catch (error) {
      console.error('Ask error:', error)
      setAnswer(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-3xl p-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
          Ask About Menus
        </h2>
        <p className="text-slate-600">
          {mode === 'multi' 
            ? "🌍 Search across all uploaded menus" 
            : "🎯 Search in specific restaurant menus"
          }
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Mode Indicator */}
        <div className="flex justify-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            mode === 'multi'
              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200'
              : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
          }`}>
            {mode === 'multi' ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                Global Search Mode
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Focused Search Mode
              </>
            )}
          </div>
        </div>

        {/* Question Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-slate-700 mb-3">
              Your Question
            </label>
            <div className="relative">
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What would you like to know? Ask about items, prices, ingredients, dietary options..."
                rows={4}
                className="input-field resize-none"
                disabled={isLoading}
              />
              <div className="absolute top-3 right-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className={`w-full font-medium py-4 px-6 rounded-xl transition-all duration-200 ${
              isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : !question.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : mode === 'multi'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transform'
                : 'btn-primary'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                <span>Thinking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Ask Question</span>
              </div>
            )}
          </button>
        </form>

        {/* Answer Display */}
        {answer && (
          <div className="animate-slide-up">
            <div className={`rounded-2xl p-6 border ${
              answer.includes('Error') 
                ? 'bg-red-50 border-red-200'
                : mode === 'multi'
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/50'
                : 'bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200/50'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  answer.includes('Error')
                    ? 'bg-red-500'
                    : mode === 'multi'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  {answer.includes('Error') ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 ${
                    answer.includes('Error')
                      ? 'text-red-800'
                      : mode === 'multi'
                      ? 'text-purple-800'
                      : 'text-slate-800'
                  }`}>
                    {answer.includes('Error') 
                      ? '❌ Error' 
                      : mode === 'multi' 
                      ? '🌍 Global Search Results' 
                      : '🎯 Search Results'
                    }
                  </h3>
                  <div className={`leading-relaxed whitespace-pre-wrap ${
                    answer.includes('Error') ? 'text-red-700' : 'text-slate-700'
                  }`}>
                    {answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
