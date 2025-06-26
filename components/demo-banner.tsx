"use client"

import { useEffect, useState } from "react"

export function DemoBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/status")
        const data = await response.json()
        setShowBanner(data.demoMode)
      } catch (error) {
        // If the request fails, assume we're in demo mode
        setShowBanner(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [])

  // Don't show anything while loading to avoid flash of content
  if (isLoading) return null

  // Don't show if not in demo mode
  if (!showBanner) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-4 py-2 text-center text-sm">
      Demo Mode: Connect to Neon integration to get started
    </div>
  )
}
