// Simplified AI functions without external ML libraries for Vercel compatibility

export function segmentCustomers(features: number[][]) {
  // Simple segmentation based on spending patterns
  const segments = features.map(([spend, visits, recencyDays]) => {
    if (spend > 100 && visits > 5) return 'high_value'
    if (spend > 50 && visits > 3) return 'medium_value'
    return 'low_value'
  })
  return { segments }
}

export function trainChurnModel(dataset: { X: number[][], y: number[] }) {
  // Simple heuristic-based churn prediction
  return {
    predict: (x: number[]) => {
      const [spend, visits, recencyDays] = x
      // Higher recency days = higher churn risk
      if (recencyDays > 30) return 0.8
      if (recencyDays > 14) return 0.6
      if (recencyDays > 7) return 0.4
      return 0.2
    }
  }
}

export function predictChurn(model: any, x: number[]) {
  return model.predict(x)
}

export function recommendOffers(customerFeatureVector: number[]) {
  // Simple heuristic-based recommendations
  const [spend, visits, recencyDays] = customerFeatureVector
  const offers = []
  
  // Come back offer for inactive customers
  if (recencyDays > 21) {
    offers.push({ 
      id: "comeback", 
      title: "We Miss You!", 
      type: "discount", 
      value: 20, 
      expiryDays: 14 
    })
  }
  
  // Boost offer for low spenders
  if (spend < 50) {
    offers.push({ 
      id: "boost", 
      title: "Double Points Weekend", 
      type: "bonus_points", 
      value: 100, 
      expiryDays: 3 
    })
  }
  
  // VIP offer for frequent visitors
  if (visits > 10) {
    offers.push({ 
      id: "vip", 
      title: "VIP Double Points", 
      type: "bonus_points", 
      value: 100, 
      expiryDays: 3 
    })
  }
  
  // Welcome back for medium recency
  if (recencyDays > 7 && recencyDays <= 21) {
    offers.push({ 
      id: "welcome_back", 
      title: "Welcome Back!", 
      type: "bonus_points", 
      value: 50, 
      expiryDays: 7 
    })
  }
  
  return offers
}

// Additional AI functions for analytics
export function calculateEngagementScore(spend: number, visits: number, recencyDays: number) {
  const spendScore = Math.min(spend / 100, 1) * 0.4
  const visitScore = Math.min(visits / 10, 1) * 0.4
  const recencyScore = Math.max(0, (30 - recencyDays) / 30) * 0.2
  return spendScore + visitScore + recencyScore
}

export function predictNextVisit(visits: number, avgSpend: number, lastVisitDays: number) {
  // Simple prediction based on historical patterns
  const baseFrequency = visits > 0 ? 30 / visits : 30
  const recencyFactor = Math.max(0.5, Math.min(2, lastVisitDays / 15))
  return Math.round(baseFrequency * recencyFactor)
}


