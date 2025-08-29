"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

interface CustomerData {
  id: string
  name: string
  email: string
  points: number
  totalSpent: number
  visitCount: number
  joinDate: string
  lastVisit: string
  tier: string
}

interface Transaction {
  id: string
  amount: number
  pointsEarned: number
  pointsRedeemed: number
  location: string
  timestamp: string
  paymentMethod: string
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  category: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  expiryDate?: string
}

interface Geofence {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
}

interface Purchase {
  id: string
  location: string
  amount: number
  items: string
  timestamp: string
  status: string
  pointsAwarded: number
}

export function useDatabase() {
  const { user } = useAuth()
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [geofences, setGeofences] = useState<Geofence[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchCustomerData = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("loyalty-token")
      if (!token) return

      // Fetch customer data
      const customerRes = await fetch(`/api/users/${user.id}?tenantId=${user.tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const customerData = await customerRes.json()

      if (customerData.ok) {
        setCustomerData(customerData.customer)
      }

      // Fetch transactions
      const transactionsRes = await fetch(`/api/transactions?tenantId=${user.tenantId}&userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const transactionsData = await transactionsRes.json()

      if (transactionsData.ok) {
        setTransactions(transactionsData.transactions)
      }

      // Fetch rewards
      const rewardsRes = await fetch(`/api/rewards?tenantId=${user.tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const rewardsData = await rewardsRes.json()

      if (rewardsData.ok) {
        setRewards(rewardsData.rewards)
      }

      // Fetch geofences
      const geofencesRes = await fetch(`/api/geofences?tenantId=${user.tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const geofencesData = await geofencesRes.json()

      if (geofencesData.ok) {
        setGeofences(geofencesData.geofences)
      }

      // Fetch purchases
      const purchasesRes = await fetch(`/api/purchases?tenantId=${user.tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const purchasesData = await purchasesRes.json()

      if (purchasesData.ok) {
        setPurchases(purchasesData.purchases)
      }

    } catch (err) {
      setError("Failed to fetch data")
      console.error("Database fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const createPurchase = async (purchaseData: {
    tenantId: string
    location: string
    amount: number
    items: Array<{ name: string; category: string; price: number; quantity: number }>
  }) => {
    try {
      const token = localStorage.getItem("loyalty-token")
      if (!token) throw new Error("No token")

      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(purchaseData)
      })

      const data = await res.json()
      if (!data.ok) {
        throw new Error(data.error || "Failed to create purchase")
      }

      // Refresh data
      await fetchCustomerData()
      return { success: true, message: "Purchase recorded successfully! Awaiting approval." }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Failed to record purchase" }
    }
  }

  const checkInAtLocation = async (coords: { latitude: number; longitude: number }) => {
    try {
      const token = localStorage.getItem("loyalty-token")
      if (!token) throw new Error("No token")

      // Check if user is within any geofence
      const isWithinGeofence = geofences.some(fence => {
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          fence.latitude,
          fence.longitude
        )
        return distance <= fence.radiusMeters
      })

      if (!isWithinGeofence) {
        return { success: false, message: "You are not at a participating location" }
      }

      // Award check-in bonus
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tenantId: user?.tenantId,
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      })

      const data = await res.json()
      if (data.ok) {
        await fetchCustomerData() // Refresh data
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.error }
      }
    } catch (err) {
      return { success: false, message: "Check-in failed" }
    }
  }

  const redeemReward = async (rewardId: string) => {
    try {
      const token = localStorage.getItem("loyalty-token")
      if (!token) throw new Error("No token")

      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rewardId,
          tenantId: user?.tenantId
        })
      })

      const data = await res.json()
      if (data.ok) {
        await fetchCustomerData() // Refresh data
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.error }
      }
    } catch (err) {
      return { success: false, message: "Redemption failed" }
    }
  }

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  useEffect(() => {
    if (user) {
      fetchCustomerData()
    }
  }, [user])

  return {
    customerData,
    transactions,
    rewards,
    geofences,
    purchases,
    loading,
    error,
    createPurchase,
    checkInAtLocation,
    redeemReward,
    refreshData: fetchCustomerData
  }
}
