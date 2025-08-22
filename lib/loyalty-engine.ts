import type { Customer, Transaction, Reward, LoyaltyProgram } from "./mock-data"

export interface PointsCalculation {
  basePoints: number
  bonusPoints: number
  tierMultiplier: number
  totalPoints: number
}

export interface RedemptionResult {
  success: boolean
  message: string
  newPointsBalance?: number
  rewardId?: string
}

export interface TierProgressInfo {
  currentTier: string
  nextTier: string | null
  pointsToNext: number
  progressPercentage: number
}

export class LoyaltyEngine {
  private loyaltyProgram: LoyaltyProgram

  constructor(loyaltyProgram: LoyaltyProgram) {
    this.loyaltyProgram = loyaltyProgram
  }

  // Calculate points earned from a transaction
  calculatePoints(amount: number, customer: Customer, isSpecialOffer = false): PointsCalculation {
    const basePoints = Math.floor(amount * this.loyaltyProgram.pointsPerDollar)

    // Get tier multiplier
    const tier = this.loyaltyProgram.tiers.find((t) => t.name.toLowerCase() === customer.tier)
    const tierMultiplier = tier?.multiplier || 1

    // Calculate bonus points (special offers, birthday, etc.)
    let bonusPoints = 0
    if (isSpecialOffer) {
      bonusPoints = Math.floor(basePoints * 0.5) // 50% bonus for special offers
    }

    // Check if it's customer's birthday month
    const today = new Date()
    const joinDate = new Date(customer.joinDate)
    if (today.getMonth() === joinDate.getMonth()) {
      bonusPoints += this.loyaltyProgram.rules.birthdayBonus
    }

    const totalPoints = Math.floor((basePoints + bonusPoints) * tierMultiplier)

    return {
      basePoints,
      bonusPoints,
      tierMultiplier,
      totalPoints,
    }
  }

  // Process a transaction and update customer points
  processTransaction(
    customer: Customer,
    transaction: Omit<Transaction, "id" | "customerId" | "tenantId" | "pointsEarned">,
  ): {
    updatedCustomer: Customer
    pointsEarned: PointsCalculation
    newTransaction: Transaction
  } {
    const pointsCalc = this.calculatePoints(transaction.amount, customer)

    // Update customer
    const updatedCustomer: Customer = {
      ...customer,
      points: customer.points + pointsCalc.totalPoints,
      totalSpent: customer.totalSpent + transaction.amount,
      visitCount: customer.visitCount + 1,
      lastVisit: transaction.timestamp,
    }

    // Check for tier upgrade
    const newTier = this.calculateTier(updatedCustomer.points)
    if (newTier !== customer.tier) {
      updatedCustomer.tier = newTier
    }

    const newTransaction: Transaction = {
      ...transaction,
      id: `txn_${Date.now()}`,
      customerId: customer.id,
      tenantId: customer.tenantId,
      pointsEarned: pointsCalc.totalPoints,
      pointsRedeemed: 0,
    }

    return {
      updatedCustomer,
      pointsEarned: pointsCalc,
      newTransaction,
    }
  }

  // Redeem a reward
  redeemReward(customer: Customer, reward: Reward): RedemptionResult {
    // Check if customer has enough points
    if (customer.points < reward.pointsCost) {
      return {
        success: false,
        message: `Insufficient points. You need ${reward.pointsCost - customer.points} more points.`,
      }
    }

    // Check if reward is active
    if (!reward.isActive) {
      return {
        success: false,
        message: "This reward is no longer available.",
      }
    }

    // Check expiry date
    if (reward.expiryDate && new Date() > reward.expiryDate) {
      return {
        success: false,
        message: "This reward has expired.",
      }
    }

    // Check usage limit
    if (reward.usageLimit && reward.usageCount >= reward.usageLimit) {
      return {
        success: false,
        message: "This reward has reached its usage limit.",
      }
    }

    // Check tier requirements
    if (reward.conditions?.minTier) {
      const tierOrder = ["bronze", "silver", "gold", "platinum"]
      const customerTierIndex = tierOrder.indexOf(customer.tier)
      const requiredTierIndex = tierOrder.indexOf(reward.conditions.minTier)

      if (customerTierIndex < requiredTierIndex) {
        return {
          success: false,
          message: `This reward requires ${reward.conditions.minTier} tier or higher.`,
        }
      }
    }

    const newPointsBalance = customer.points - reward.pointsCost

    return {
      success: true,
      message: `Successfully redeemed ${reward.name}!`,
      newPointsBalance,
      rewardId: reward.id,
    }
  }

  // Calculate customer tier based on points
  calculateTier(points: number): Customer["tier"] {
    const tiers = [...this.loyaltyProgram.tiers].reverse() // Start from highest tier

    for (const tier of tiers) {
      if (points >= tier.minPoints) {
        return tier.name.toLowerCase() as Customer["tier"]
      }
    }

    return "bronze" // Default tier
  }

  // Get tier progress information
  getTierProgress(customer: Customer): TierProgressInfo {
    const currentTierIndex = this.loyaltyProgram.tiers.findIndex((t) => t.name.toLowerCase() === customer.tier)

    const nextTierIndex = currentTierIndex + 1
    const nextTier = nextTierIndex < this.loyaltyProgram.tiers.length ? this.loyaltyProgram.tiers[nextTierIndex] : null

    if (!nextTier) {
      return {
        currentTier: customer.tier,
        nextTier: null,
        pointsToNext: 0,
        progressPercentage: 100,
      }
    }

    const currentTierPoints = this.loyaltyProgram.tiers[currentTierIndex].minPoints
    const pointsToNext = nextTier.minPoints - customer.points
    const progressRange = nextTier.minPoints - currentTierPoints
    const currentProgress = customer.points - currentTierPoints
    const progressPercentage = Math.min(100, Math.max(0, (currentProgress / progressRange) * 100))

    return {
      currentTier: customer.tier,
      nextTier: nextTier.name.toLowerCase(),
      pointsToNext: Math.max(0, pointsToNext),
      progressPercentage,
    }
  }

  // Generate personalized offers based on customer behavior
  generatePersonalizedOffers(customer: Customer): Array<{
    id: string
    title: string
    description: string
    type: "bonus_points" | "discount" | "free_item"
    value: number
    expiryDays: number
    conditions?: string
  }> {
    const offers = []

    // Favorite item bonus
    if (customer.preferences.favoriteItems.length > 0) {
      const favoriteItem = customer.preferences.favoriteItems[0]
      offers.push({
        id: `fav_${customer.id}_${Date.now()}`,
        title: `Your Favorite: ${favoriteItem}`,
        description: `Get 50 bonus points on your next ${favoriteItem.toLowerCase()} purchase`,
        type: "bonus_points" as const,
        value: 50,
        expiryDays: 7,
      })
    }

    // Visit frequency bonus
    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysSinceLastVisit > 7) {
      offers.push({
        id: `comeback_${customer.id}_${Date.now()}`,
        title: "We Miss You!",
        description: "Get 20% off your next purchase",
        type: "discount" as const,
        value: 20,
        expiryDays: 14,
      })
    }

    // High-value customer rewards
    if (customer.totalSpent > 1000) {
      offers.push({
        id: `vip_${customer.id}_${Date.now()}`,
        title: "VIP Double Points",
        description: "Earn 2x points on all purchases this weekend",
        type: "bonus_points" as const,
        value: 100, // 100% bonus
        expiryDays: 3,
        conditions: "Valid weekends only",
      })
    }

    return offers
  }

  // Analyze customer behavior and predict churn risk
  analyzeCustomerBehavior(
    customer: Customer,
    transactions: Transaction[],
  ): {
    churnRisk: "low" | "medium" | "high"
    lifetimeValue: number
    avgTransactionValue: number
    visitFrequency: number
    recommendations: string[]
  } {
    const customerTransactions = transactions.filter((t) => t.customerId === customer.id)

    // Calculate metrics
    const avgTransactionValue =
      customerTransactions.length > 0
        ? customerTransactions.reduce((sum, t) => sum + t.amount, 0) / customerTransactions.length
        : 0

    const daysSinceJoin = Math.floor(
      (new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 60 * 60 * 24),
    )

    const visitFrequency = daysSinceJoin > 0 ? customer.visitCount / (daysSinceJoin / 30) : 0 // visits per month

    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
    )

    // Determine churn risk
    let churnRisk: "low" | "medium" | "high" = "low"
    if (daysSinceLastVisit > 30) churnRisk = "high"
    else if (daysSinceLastVisit > 14 || visitFrequency < 1) churnRisk = "medium"

    // Calculate lifetime value (simplified)
    const lifetimeValue = customer.totalSpent * (visitFrequency * 12) // Projected annual value

    // Generate recommendations
    const recommendations = []
    if (churnRisk === "high") {
      recommendations.push("Send win-back campaign", "Offer special discount")
    }
    if (avgTransactionValue < 10) {
      recommendations.push("Promote higher-value items", "Suggest add-ons")
    }
    if (visitFrequency > 4) {
      recommendations.push("Consider VIP program", "Offer exclusive rewards")
    }

    return {
      churnRisk,
      lifetimeValue,
      avgTransactionValue,
      visitFrequency,
      recommendations,
    }
  }
}
