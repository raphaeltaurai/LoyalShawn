"use client"

import React from "react"
import { useAuth } from "./auth-provider"
import { useLoyaltyEngine } from "@/hooks/use-loyalty-engine"
import { useSecurity } from "@/hooks/use-security"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { LogOut, Gift, Star, Clock, TrendingUp, MapPin } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SecurityBanner } from "./security-banner"
import { useLocation } from "@/hooks/use-location"

export function CustomerDashboard() {
  const { user, logout } = useAuth()
  const { customers, rewards, redeemReward, getTierProgress, getPersonalizedOffers, checkInAtLocation, configureGeofences, fetchGeofences } = useLoyaltyEngine()
  const { auditLog } = useSecurity()
  const { toast } = useToast()
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null)

  React.useEffect(() => {
    auditLog("CUSTOMER_DASHBOARD_ACCESSED")
    // Load geofences from backend
    fetchGeofences("coffee-shop-1")
  }, [auditLog])
  const { coords, loading: locLoading, error: locError, refresh } = useLocation([])

  const handleCheckIn = async () => {
    if (!customer) return
    if (!coords) {
      toast({ title: "Location not available", description: "Please enable location and try again.", variant: "destructive" })
      return
    }
    const result = checkInAtLocation(customer.id, coords)
    if (result.success) {
      toast({ title: "Checked in!", description: result.message })
    } else {
      toast({ title: "Check-in failed", description: result.message, variant: "destructive" })
    }
  }

  let customer = customers.find((c) => c.id === user?.id)

  if (!customer && user?.email) {
    customer = customers.find((c) => c.email === user.email)

    if (!customer) {
      customer = {
        id: user.id,
        name: user.name || "New Customer",
        email: user.email,
        points: 0,
        tier: "bronze" as const,
        totalSpent: 0,
        visitCount: 1,
        joinDate: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        tenantId: "default",
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
        },
        engagementScore: 50,
      }
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LoyaltyAI
              </h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Customer Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecurityBanner />

        <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-foreground">Your Points Balance</span>
              <Badge
                className={`capitalize font-medium ${
                  customer.tier === "platinum"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                    : customer.tier === "gold"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                      : customer.tier === "silver"
                        ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                        : "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
                }`}
              >
                {customer.tier} Member
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {customer.points.toLocaleString()} Points
            </div>
            {tierProgress && tierProgress.nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress to {tierProgress.nextTier}</span>
                  <span>{tierProgress.pointsToNext.toLocaleString()} points to go</span>
                </div>
                <Progress value={tierProgress.progressPercentage} className="h-3 bg-muted" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{customer.visitCount}</div>
                <div className="text-xs text-muted-foreground">Total Visits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${customer.totalSpent.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {Math.floor((new Date().getTime() - new Date(customer.joinDate).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-xs text-muted-foreground">Days Member</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-card border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Gift className="h-5 w-5 mr-2 text-blue-600" />
              Available Rewards
            </CardTitle>
            <CardDescription className="text-muted-foreground">Redeem your points for these rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={refresh} disabled={locLoading}>
                {locLoading ? "Getting location..." : "Refresh Location"}
              </Button>
              <Button size="sm" onClick={handleCheckIn} className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" /> Check-in for Bonus
              </Button>
            </div>
            {locError && <p className="text-xs text-destructive mb-2">{locError}</p>}
            {coords && (
              <p className="text-xs text-muted-foreground mb-2">Lat: {coords.latitude.toFixed(4)}, Lng: {coords.longitude.toFixed(4)}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canAfford = customer.points >= reward.pointsCost
                const isLoading = isRedeeming === reward.id

                return (
                  <div
                    key={reward.id}
                    className={`p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors ${!canAfford ? "opacity-50" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground">{reward.name}</h3>
                      <Badge variant="outline" className="border-border text-foreground">
                        {reward.pointsCost.toLocaleString()} pts
                      </Badge>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Coffee Purchase</p>
                    <p className="text-sm text-muted-foreground">Main Street Location</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">+25 pts</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Redeemed Free Pastry</p>
                    <p className="text-sm text-muted-foreground">Downtown Location</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600 dark:text-red-400">-300 pts</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">Lunch Purchase</p>
                    <p className="text-sm text-muted-foreground">Airport Location</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">+45 pts</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Star className="h-5 w-5 mr-2 text-blue-600" />
                Personalized Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizedOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50"
                  >
                    <p className="font-medium text-foreground">{offer.title}</p>
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground">
                        Expires in {offer.expiryDays} days
                      </Badge>
                      {offer.type === "bonus_points" && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
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
