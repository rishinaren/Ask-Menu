'use client'

interface TestUploadProps {
  onUploadSuccess: (restaurantId: string, restaurantName: string) => void
}

export default function TestUpload({ onUploadSuccess }: TestUploadProps) {
  return (
    <div className="glass-card rounded-3xl p-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">Test Upload Component</h2>
      <p className="text-slate-600">This is a test component to check imports</p>
    </div>
  )
}
