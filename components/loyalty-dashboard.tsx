"use client"

import { useAuth } from "./auth-provider"
import { AdminDashboard } from "./admin-dashboard"
import { CustomerDashboard } from "./customer-dashboard"

export function LoyaltyDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return user.role === "admin" ? <AdminDashboard /> : <CustomerDashboard />
}
