// Mock data structures for the loyalty system

export interface Customer {
  id: string
  email: string
  name: string
  phone?: string
  points: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  totalSpent: number
  visitCount: number
  lastVisit: Date
  joinDate: Date
  tenantId: string
  preferences: {
    favoriteItems: string[]
    preferredLocations: string[]
    communicationPreferences: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  aiInsights: {
    churnRisk: "low" | "medium" | "high"
    lifetimeValue: number
    nextVisitPrediction: Date
    recommendedOffers: string[]
  }
}

export interface Transaction {
  id: string
  customerId: string
  tenantId: string
  amount: number
  pointsEarned: number
  pointsRedeemed: number
  items: {
    name: string
    category: string
    price: number
    quantity: number
  }[]
  location: string
  timestamp: Date
  paymentMethod: string
}

export interface Reward {
  id: string
  tenantId: string
  name: string
  description: string
  pointsCost: number
  category: string
  isActive: boolean
  expiryDate?: Date
  usageLimit?: number
  usageCount: number
  conditions?: {
    minTier?: string
    minSpend?: number
    validLocations?: string[]
  }
}

export interface LoyaltyProgram {
  id: string
  tenantId: string
  name: string
  pointsPerDollar: number
  tiers: {
    name: string
    minPoints: number
    benefits: string[]
    multiplier: number
  }[]
  rules: {
    pointExpiry: number // days
    referralBonus: number
    birthdayBonus: number
    checkInBonusPoints?: number
    checkInRadiusMeters?: number
  }
}

// Mock data
export const mockCustomers: Customer[] = [
  {
    id: "1",
    email: "customer@example.com",
    name: "John Customer",
    phone: "+1234567890",
    points: 1247,
    tier: "gold",
    totalSpent: 2847.5,
    visitCount: 47,
    lastVisit: new Date("2024-01-20"),
    joinDate: new Date("2023-06-15"),
    tenantId: "coffee-shop-1",
    preferences: {
      favoriteItems: ["Latte", "Croissant", "Americano"],
      preferredLocations: ["Main Street", "Downtown"],
      communicationPreferences: {
        email: true,
        sms: true,
        push: false,
      },
    },
    aiInsights: {
      churnRisk: "low",
      lifetimeValue: 4200,
      nextVisitPrediction: new Date("2024-01-22"),
      recommendedOffers: ["Double Points Weekend", "Latte Bonus"],
    },
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    customerId: "1",
    tenantId: "coffee-shop-1",
    amount: 12.5,
    pointsEarned: 25,
    pointsRedeemed: 0,
    items: [
      { name: "Large Latte", category: "Coffee", price: 5.5, quantity: 1 },
      { name: "Blueberry Muffin", category: "Pastry", price: 3.5, quantity: 1 },
      { name: "Extra Shot", category: "Add-on", price: 0.75, quantity: 1 },
    ],
    location: "Main Street",
    timestamp: new Date("2024-01-20T14:30:00"),
    paymentMethod: "Credit Card",
  },
]

export const mockRewards: Reward[] = [
  {
    id: "1",
    tenantId: "coffee-shop-1",
    name: "Free Coffee",
    description: "Any size coffee drink",
    pointsCost: 500,
    category: "Beverages",
    isActive: true,
    usageCount: 0,
  },
  {
    id: "2",
    tenantId: "coffee-shop-1",
    name: "Free Pastry",
    description: "Any pastry or dessert",
    pointsCost: 300,
    category: "Food",
    isActive: true,
    usageCount: 0,
  },
  {
    id: "3",
    tenantId: "coffee-shop-1",
    name: "10% Off Next Visit",
    description: "Valid for 30 days",
    pointsCost: 200,
    category: "Discounts",
    isActive: true,
    usageCount: 0,
  },
]

export const mockLoyaltyProgram: LoyaltyProgram = {
  id: "1",
  tenantId: "coffee-shop-1",
  name: "Coffee Lovers Rewards",
  pointsPerDollar: 2,
  tiers: [
    { name: "Bronze", minPoints: 0, benefits: ["Basic rewards"], multiplier: 1 },
    { name: "Silver", minPoints: 500, benefits: ["5% bonus points", "Birthday reward"], multiplier: 1.05 },
    {
      name: "Gold",
      minPoints: 1000,
      benefits: ["10% bonus points", "Free birthday drink", "Early access"],
      multiplier: 1.1,
    },
    {
      name: "Platinum",
      minPoints: 2000,
      benefits: ["15% bonus points", "Free monthly drink", "VIP support"],
      multiplier: 1.15,
    },
  ],
  rules: {
    pointExpiry: 365,
    referralBonus: 100,
    birthdayBonus: 250,
    checkInBonusPoints: 50,
    checkInRadiusMeters: 150,
  },
}
