"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/placeholder-logo.svg"
              alt="LoyaltyAI Logo"
              width={32}
              height={32}
            />
            <span className="font-bold text-lg">LoyaltyAI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <ThemeToggle />
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/signup">Sign up</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
