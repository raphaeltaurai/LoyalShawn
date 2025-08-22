"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const { login, googleLogin, isLoading } = useAuth()
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password)
    if (success) {
      router.push("/dashboard")
    }
    return success
  }

  const handleGoogleLogin = async () => {
    const success = await googleLogin()
    if (success) {
      router.push("/dashboard")
    }
    return success
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 slide-in-from-bottom-4">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            LoyaltyAI
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your loyalty platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginForm
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            isLoading={isLoading}
          />

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border">
            <p className="font-semibold mb-3 text-sm text-blue-700 dark:text-blue-300">
              🚀 Demo Accounts
            </p>
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
