"use client"

import { useAuth } from "./auth-provider"
import { AdminDashboard } from "./admin-dashboard"
import { CustomerDashboard } from "./customer-dashboard"
import { useEffect } from "react"

export function LoyaltyDashboard() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === "management") {
        window.location.href = "/management"
      } else if (user.role === "admin") {
        // Stay on current page for admin dashboard
      } else {
        // Stay on current page for customer dashboard
      }
    }
  }, [user])

  if (!user) return null

  return user.role === "admin" ? <AdminDashboard /> : <CustomerDashboard />
}
