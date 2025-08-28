'use client'

import { useState, useEffect } from 'react'

interface Restaurant {
  id: number
  name: string
  chunk_count: number
}

export default function SimpleRestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants()
    // Set up an interval to periodically check for new restaurants
    const interval = setInterval(fetchRestaurants, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/restaurants')
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants')
      }
      const data = await response.json()
      setRestaurants(data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mr-3"></div>
        <span className="text-slate-600">Loading restaurants...</span>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-500">No restaurants uploaded yet. Upload your first menu to get started!</p>
      </div>
    )
  }

  return (
    <div className="text-center py-4">
      <p className="text-lg text-slate-700 font-medium">
        Ready to chat about{' '}
        {restaurants.map((restaurant, index) => (
          <span key={restaurant.id}>
            <span className="text-blue-600 font-semibold">{restaurant.name}</span>
            {index < restaurants.length - 2 && ', '}
            {index === restaurants.length - 2 && restaurants.length > 1 && ' and '}
          </span>
        ))}
      </p>
    </div>
  )
}
