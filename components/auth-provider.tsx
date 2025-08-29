"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { CryptoUtils } from "@/lib/utils"
import { GoogleAuthService } from "../lib/google-auth"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "./ui/loading-spinner"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer" | "management"
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
    throw new Error("useAuth must be used within an AuthProvider")
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const googleAuth = GoogleAuthService.getInstance()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUserRaw = localStorage.getItem("loyalty-user")
        if (storedUserRaw) {
          const storedUser = CryptoUtils.decrypt(storedUserRaw)
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
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.ok && data.user && data.token) {
        setUser(data.user)
        localStorage.setItem("loyalty-user", CryptoUtils.encrypt(JSON.stringify(data.user)))
        localStorage.setItem("loyalty-token", data.token)
        setIsLoading(false)
        return true
      }
    } catch (e) {
      console.error("Login API failed", e)
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
        localStorage.setItem("loyalty-user", CryptoUtils.encrypt(JSON.stringify(newUser)))
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
      localStorage.removeItem("loyalty-token")
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

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
