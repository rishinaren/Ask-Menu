'use client'

import { useState } from 'react'

interface UploadProps {
  onUploadSuccess: (restaurantId: string, restaurantName: string) => void
}

function Upload({ onUploadSuccess }: UploadProps) {
  const [restaurantName, setRestaurantName] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = () => {
    if (restaurantName && files.length > 0) {
      onUploadSuccess('1', restaurantName)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Menu</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Restaurant Name</label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter restaurant name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Menu Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {files.length > 0 && (
          <div className="text-sm text-green-600">
            {files.length} file(s) selected
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!restaurantName || files.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:bg-gray-300"
        >
          Upload Menu
        </button>
      </div>
    </div>
  )
}

export default Upload
