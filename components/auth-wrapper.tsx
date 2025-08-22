"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-provider"
import { LoadingSpinner } from "./ui/loading-spinner"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-blue-600">LoyaltyAI</h2>
            <p className="text-muted-foreground">Loading your loyalty platform...</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
