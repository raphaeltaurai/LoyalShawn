import { kmeans } from "ml-kmeans"
import logistic from "ml-logistic-regression"
import * as ss from "simple-statistics"

export function segmentCustomers(features) {
  // features: Array<[spend, visits, recencyDays]>
  const k = 3
  const { clusters, centroids } = kmeans(features, k)
  return { clusters, centroids }
}

export function trainChurnModel(dataset) {
  // dataset: { X: number[][], y: number[] }
  const model = new logistic.LogisticRegression({ numSteps: 2000, learningRate: 5e-3 })
  model.train(dataset.X, dataset.y)
  return model
}

export function predictChurn(model, x) {
  return model.predict(x)
}

export function recommendOffers(customerFeatureVector) {
  // Simple heuristic + stats: if low spend, promote discount; if long recency, come-back bonus
  const [spend, visits, recencyDays] = customerFeatureVector
  const offers = []
  if (recencyDays > 21) offers.push({ id: " comeback ", title: "We Miss You!", type: "discount", value: 20, expiryDays: 14 })
  if (spend < ss.quantileSorted([10, 20, 30, 50, 80, 120], 0.5)) offers.push({ id: " boost ", title: "Double Points Weekend", type: "bonus_points", value: 100, expiryDays: 3 })
  if (visits > 10) offers.push({ id: " vip ", title: "VIP Double Points", type: "bonus_points", value: 100, expiryDays: 3 })
  return offers
}


