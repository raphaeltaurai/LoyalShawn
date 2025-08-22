"use client"

import React from "react"
import { useAuth } from "./auth-wrapper"
import { useLoyaltyEngine } from "@/hooks/use-loyalty-engine"
import { useSecurity } from "@/hooks/use-security"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { LogOut, Gift, Star, Clock, TrendingUp } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SecurityBanner } from "./security-banner"

export function CustomerDashboard() {
  const { user, logout } = useAuth()
  const { customers, rewards, redeemReward, getTierProgress, getPersonalizedOffers } = useLoyaltyEngine()
  const { auditLog } = useSecurity()
  const { toast } = useToast()
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null)

  React.useEffect(() => {
    auditLog("CUSTOMER_DASHBOARD_ACCESSED")
  }, [auditLog])

  const customer = customers.find((c) => c.id === user?.id)
  if (!customer) return null

  const tierProgress = getTierProgress(customer.id)
  const personalizedOffers = getPersonalizedOffers(customer.id)

  const handleRedeemReward = async (rewardId: string) => {
    setIsRedeeming(rewardId)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const result = redeemReward(customer.id, rewardId)

      if (result?.success) {
        toast({
          title: "Reward Redeemed!",
          description: result.message,
        })
      } else {
        toast({
          title: "Redemption Failed",
          description: result?.message || "Unable to redeem reward",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }

    setIsRedeeming(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">LoyaltyAI</h1>
              <Badge variant="secondary">Customer Portal</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecurityBanner />

        {/* Points Balance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Points Balance</span>
              <Badge className="bg-blue-600 capitalize">{customer.tier} Member</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 mb-4">{customer.points.toLocaleString()} Points</div>
            {tierProgress && tierProgress.nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to {tierProgress.nextTier}</span>
                  <span>{tierProgress.pointsToNext.toLocaleString()} points to go</span>
                </div>
                <Progress value={tierProgress.progressPercentage} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{customer.visitCount}</div>
                <div className="text-xs text-muted-foreground">Total Visits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">${customer.totalSpent.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.floor((new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-xs text-muted-foreground">Days Member</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Available Rewards
            </CardTitle>
            <CardDescription>Redeem your points for these rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canAfford = customer.points >= reward.pointsCost
                const isLoading = isRedeeming === reward.id

                return (
                  <div key={reward.id} className={`p-4 border rounded-lg ${!canAfford ? "opacity-50" : ""}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{reward.name}</h3>
                      <Badge variant="outline">{reward.pointsCost.toLocaleString()} pts</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!canAfford || isLoading}
                      onClick={() => handleRedeemReward(reward.id)}
                    >
                      {isLoading
                        ? "Redeeming..."
                        : canAfford
                          ? "Redeem"
                          : `Need ${(reward.pointsCost - customer.points).toLocaleString()} more points`}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Coffee Purchase</p>
                    <p className="text-sm text-muted-foreground">Main Street Location</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+25 pts</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Redeemed Free Pastry</p>
                    <p className="text-sm text-muted-foreground">Downtown Location</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">-300 pts</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Lunch Purchase</p>
                    <p className="text-sm text-muted-foreground">Airport Location</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">+45 pts</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Offers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Personalized Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizedOffers.map((offer) => (
                  <div key={offer.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-medium">{offer.title}</p>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary">Expires in {offer.expiryDays} days</Badge>
                      {offer.type === "bonus_points" && (
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">+{offer.value} pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
