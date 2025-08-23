"use client"

import { useState } from "react"
import { LoyaltyEngine } from "@/lib/loyalty-engine"
import { SecurityManager, validationSchemas } from "@/lib/security"
import { mockLoyaltyProgram, mockCustomers, mockTransactions, mockRewards } from "@/lib/mock-data"
import type { Customer, Transaction, Reward } from "@/lib/mock-data"
import { useSecurity } from "./use-security"
import type { Coordinates, GeoFence } from "@/lib/location"

export function useLoyaltyEngine() {
  const [loyaltyEngine] = useState(() => new LoyaltyEngine(mockLoyaltyProgram))
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [rewards, setRewards] = useState<Reward[]>(mockRewards)
  const { securityContext, validateTenantAccess, auditLog } = useSecurity()
  const [geofences, setGeofences] = useState<Record<string, GeoFence[]>>({})

  const configureGeofences = (tenantId: string, fences: GeoFence[]) => {
    setGeofences((prev) => ({ ...prev, [tenantId]: fences }))
    loyaltyEngine.registerGeofences(
      tenantId,
      fences.map((f) => ({ id: f.id, name: f.name, latitude: f.latitude, longitude: f.longitude, radiusMeters: f.radiusMeters }))
    )
  }

  const getProgram = () => loyaltyEngine.getProgram()
  const updateProgramRules = (rulesPartial: Partial<typeof mockLoyaltyProgram.rules>) => {
    if (!securityContext || securityContext.role !== "admin") return
    loyaltyEngine.updateRules(rulesPartial)
    auditLog("PROGRAM_RULES_UPDATED", rulesPartial)
  }

  const getFilteredCustomers = (): Customer[] => {
    if (!securityContext) return []

    return customers.filter((customer) => validateTenantAccess(customer.tenantId))
  }

  const getFilteredTransactions = (): Transaction[] => {
    if (!securityContext) return []

    return transactions.filter((transaction) => validateTenantAccess(transaction.tenantId))
  }

  const getFilteredRewards = (): Reward[] => {
    if (!securityContext) return []

    return rewards.filter((reward) => validateTenantAccess(reward.tenantId))
  }

  // Process a new transaction with security validation
  const processTransaction = (
    customerId: string,
    transactionData: {
      amount: number
      items: Array<{ name: string; category: string; price: number; quantity: number }>
      location: string
      paymentMethod: string
    },
  ) => {
    if (!securityContext) return null

    const validation = SecurityManager.validateInput(transactionData, validationSchemas.transaction)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
    }

    if (!SecurityManager.checkRateLimit(`${securityContext.userId}_transaction`, 10, 60000)) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }

    const customer = customers.find((c) => c.id === customerId)
    if (!customer || !validateTenantAccess(customer.tenantId)) {
      auditLog("UNAUTHORIZED_TRANSACTION_ATTEMPT", { customerId })
      return null
    }

    const result = loyaltyEngine.processTransaction(customer, {
      ...transactionData,
      timestamp: new Date(),
      pointsRedeemed: 0,
    })

    // Update state
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? result.updatedCustomer : c)))
    setTransactions((prev) => [...prev, result.newTransaction])

    auditLog("TRANSACTION_PROCESSED", {
      customerId,
      amount: transactionData.amount,
      pointsEarned: result.pointsEarned.totalPoints,
    })

    return result
  }

  // Location-based: check-in to earn bonus points
  const checkInAtLocation = (customerId: string, coords: Coordinates) => {
    if (!securityContext) return { success: false, message: "Not authorized" }

    if (!SecurityManager.canCheckIn(securityContext.userId)) {
      return { success: false, message: "Too many check-ins. Try again later." }
    }

    const customer = customers.find((c) => c.id === customerId)
    if (!customer || !validateTenantAccess(customer.tenantId)) {
      auditLog("UNAUTHORIZED_CHECKIN_ATTEMPT", { customerId })
      return { success: false, message: "Unauthorized" }
    }

    const result = loyaltyEngine.awardCheckIn(customer, coords)
    if (result.success && result.updatedCustomer) {
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? result.updatedCustomer! : c)))
      auditLog("CHECKIN_AWARDED", { customerId, bonus: mockLoyaltyProgram.rules.checkInBonusPoints })
    }
    return result
  }

  // Redeem a reward with security validation
  const redeemReward = (customerId: string, rewardId: string) => {
    if (!securityContext) return null

    if (!SecurityManager.canRedeem(securityContext.userId)) {
      throw new Error("Too many redemption attempts. Please try again later.")
    }

    const customer = customers.find((c) => c.id === customerId)
    const reward = rewards.find((r) => r.id === rewardId)

    if (!customer || !reward || !validateTenantAccess(customer.tenantId) || !validateTenantAccess(reward.tenantId)) {
      auditLog("UNAUTHORIZED_REDEMPTION_ATTEMPT", { customerId, rewardId })
      return null
    }

    if (securityContext.role === "customer" && customerId !== securityContext.userId) {
      auditLog("UNAUTHORIZED_REDEMPTION_ATTEMPT", { customerId, rewardId })
      return { success: false, message: "Unauthorized access" }
    }

    const result = loyaltyEngine.redeemReward(customer, reward)

    if (result.success && result.newPointsBalance !== undefined) {
      // Update customer points
      setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, points: result.newPointsBalance! } : c)))

      // Update reward usage count
      setRewards((prev) => prev.map((r) => (r.id === rewardId ? { ...r, usageCount: r.usageCount + 1 } : r)))

      // Create redemption transaction
      const redemptionTransaction: Transaction = {
        id: `redemption_${Date.now()}`,
        customerId,
        tenantId: customer.tenantId,
        amount: 0,
        pointsEarned: 0,
        pointsRedeemed: reward.pointsCost,
        items: [{ name: reward.name, category: "Reward", price: 0, quantity: 1 }],
        location: "Online",
        timestamp: new Date(),
        paymentMethod: "Points",
      }

      setTransactions((prev) => [...prev, redemptionTransaction])

      auditLog("REWARD_REDEEMED", {
        customerId,
        rewardId,
        pointsCost: reward.pointsCost,
      })
    }

    return result
  }

  // Get customer analytics with security filtering
  const getCustomerAnalytics = (customerId: string) => {
    if (!securityContext) return null

    const customer = customers.find((c) => c.id === customerId)
    if (!customer || !validateTenantAccess(customer.tenantId)) return null

    if (securityContext.role === "customer" && customerId !== securityContext.userId) {
      return null
    }

    const customerTransactions = getFilteredTransactions().filter((t) => t.customerId === customerId)
    return loyaltyEngine.analyzeCustomerBehavior(customer, customerTransactions)
  }

  // Get tier progress with security validation
  const getTierProgress = (customerId: string) => {
    if (!securityContext) return null

    const customer = customers.find((c) => c.id === customerId)
    if (!customer || !validateTenantAccess(customer.tenantId)) return null

    if (securityContext.role === "customer" && customerId !== securityContext.userId) {
      return null
    }

    return loyaltyEngine.getTierProgress(customer)
  }

  // Generate personalized offers with security validation
  const getPersonalizedOffers = (customerId: string) => {
    if (!securityContext) return []

    const customer = customers.find((c) => c.id === customerId)
    if (!customer || !validateTenantAccess(customer.tenantId)) return []

    if (securityContext.role === "customer" && customerId !== securityContext.userId) {
      return []
    }

    return loyaltyEngine.generatePersonalizedOffers(customer)
  }

  return {
    loyaltyEngine,
    customers: getFilteredCustomers(),
    transactions: getFilteredTransactions(),
    rewards: getFilteredRewards(),
    geofences,
    configureGeofences,
    getProgram,
    updateProgramRules,
    processTransaction,
    redeemReward,
    getCustomerAnalytics,
    getTierProgress,
    getPersonalizedOffers,
    checkInAtLocation,
  }
}
