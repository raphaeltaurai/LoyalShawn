"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Alert, AlertDescription } from "./ui/alert"
import { LoadingSpinner } from "./ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>
  onGoogleLogin: () => Promise<boolean>
  isLoading: boolean
}

export function LoginForm({ onLogin, onGoogleLogin, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }
    if (!password.trim()) {
      setError("Password is required")
      return false
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    console.log("[v0] Login form submitted with email:", email)

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      console.log("[v0] Attempting login...")
      const success = await onLogin(email, password)
      console.log("[v0] Login result:", success)

      if (!success) {
        setError("Invalid credentials. Please check your email and password.")
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      } else {
        console.log("[v0] Login successful, redirecting...")
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
      }
    } catch (error) {
      console.log("[v0] Login error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    console.log("[v0] Google login initiated")

    try {
      const success = await onGoogleLogin()
      console.log("[v0] Google login result:", success)

      if (!success) {
        setError("Google authentication failed. Please try again.")
        toast({
          title: "Google Sign-in Failed",
          description: "Unable to sign in with Google. Please try again.",
          variant: "destructive",
        })
      } else {
        console.log("[v0] Google login successful")
        toast({
          title: "Welcome!",
          description: "Successfully signed in with Google.",
        })
      }
    } catch (error) {
      console.log("[v0] Google login error:", error)
      setError("Google authentication failed. Please try again.")
      toast({
        title: "Error",
        description: "Google sign-in encountered an error.",
        variant: "destructive",
      })
    }
  }

  const currentlyLoading = isLoading || isSubmitting

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={handleGoogleLogin}
        disabled={currentlyLoading}
      >
        {currentlyLoading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {currentlyLoading ? "Signing in..." : "Continue with Google"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={currentlyLoading}
            className="transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={currentlyLoading}
            className="transition-colors"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full transition-all" disabled={currentlyLoading}>
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  )
}
