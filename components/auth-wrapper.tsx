"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { LoginForm } from "./login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { LoadingSpinner } from "./ui/loading-spinner"
import { GoogleAuthService } from "../lib/google-auth"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer"
  tenantId: string
  picture?: string
  authProvider?: "email" | "google"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  googleLogin: () => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthWrapper")
  }
  return context
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@coffeeshop.com",
    name: "Coffee Shop Admin",
    role: "admin",
    tenantId: "coffee-shop-1",
    authProvider: "email",
  },
  {
    id: "2",
    email: "customer@example.com",
    name: "John Customer",
    role: "customer",
    tenantId: "coffee-shop-1",
    authProvider: "email",
  },
  {
    id: "3",
    email: "admin@restaurant.com",
    name: "Restaurant Admin",
    role: "admin",
    tenantId: "restaurant-1",
    authProvider: "email",
  },
]

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const googleAuth = GoogleAuthService.getInstance()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("loyalty-user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Failed to load stored user:", error)
        localStorage.removeItem("loyalty-user")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Mock authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser && password === "demo123") {
      setUser(foundUser)
      localStorage.setItem("loyalty-user", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const googleLogin = async (): Promise<boolean> => {
    setIsLoading(true)

    try {
      const googleUser = await googleAuth.signInWithGoogle()
      if (googleUser) {
        // Create or find user based on Google account
        const newUser: User = {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          role: "customer", // Default to customer for Google users
          tenantId: "coffee-shop-1", // Default tenant
          picture: googleUser.picture,
          authProvider: "google",
        }

        setUser(newUser)
        localStorage.setItem("loyalty-user", JSON.stringify(newUser))
        setIsLoading(false)
        return true
      }
    } catch (error) {
      console.error("Google login failed:", error)
    }

    setIsLoading(false)
    return false
  }

  const logout = async () => {
    try {
      if (user?.authProvider === "google") {
        await googleAuth.signOut()
      }
      setUser(null)
      localStorage.removeItem("loyalty-user")
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "There was an issue signing out.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 slide-in-from-bottom-4">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LoyaltyAI
            </CardTitle>
            <CardDescription className="text-base">Sign in to your loyalty platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm onLogin={login} onGoogleLogin={googleLogin} isLoading={isLoading} />

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border">
              <p className="font-semibold mb-3 text-sm text-blue-700 dark:text-blue-300">🚀 Demo Accounts</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin:</span>
                  <span className="font-mono">admin@coffeeshop.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-mono">customer@example.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <span className="font-mono">demo123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, login, googleLogin, logout, isLoading }}>{children}</AuthContext.Provider>
}
