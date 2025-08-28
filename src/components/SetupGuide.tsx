'use client'

export default function SetupGuide() {
  return (
    <div className="glass-card rounded-3xl p-8 animate-fade-in border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 text-amber-500">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-amber-800 mb-2">Setup Required</h2>
        <p className="text-amber-700">This RAG application requires Claude AI to function properly</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
            <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">1</span>
            Get Anthropic API Key
          </h3>
          <p className="text-amber-700 text-sm mb-2">Visit <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://console.anthropic.com</a></p>
          <p className="text-amber-600 text-xs">Sign up and get your API key from the dashboard</p>
        </div>
        
        <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
            <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">2</span>
            Add to Environment
          </h3>
          <p className="text-amber-700 text-sm mb-2">Create/edit <code className="bg-gray-100 px-1 rounded">.env.local</code> file:</p>
          <div className="bg-gray-800 text-green-400 p-3 rounded-lg text-sm font-mono">
            ANTHROPIC_API_KEY=your_api_key_here
          </div>
        </div>
        
        <div className="bg-white/70 rounded-xl p-4 border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
            <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">3</span>
            Restart Server
          </h3>
          <p className="text-amber-700 text-sm mb-2">Stop and restart the development server:</p>
          <div className="bg-gray-800 text-green-400 p-3 rounded-lg text-sm font-mono">
            npm run dev
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Why Claude AI?</h4>
        <p className="text-blue-700 text-sm">
          This RAG (Retrieval-Augmented Generation) application uses Claude AI to provide intelligent, 
          contextual responses based on your uploaded menu data. Without AI, it's just a basic search tool.
        </p>
      </div>
    </div>
  )
}
