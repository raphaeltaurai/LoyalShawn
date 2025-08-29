"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Gift, 
  MapPin,
  Calendar,
  RefreshCw
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalCustomers: number
    totalAdmins: number
    totalRevenue: number
    totalPointsIssued: number
    totalPointsRedeemed: number
    avgTransactionValue: number
    activePeriod: string
  }
  dailyActivity: Array<{
    date: string
    transactions: number
    revenue: number
    pointsIssued: number
  }>
  locationStats: Record<string, number>
  topCustomers: Array<{
    userId: string
    points: number
  }>
  rewards: {
    totalRewards: number
    totalUsage: number
  }
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("30")

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch(`/api/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error || "Failed to fetch analytics")
      } else {
        setAnalytics(data.analytics)
      }
    } catch {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  if (!user || user.role !== "admin") {
    return <div className="p-6">Access denied</div>
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
        <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights from the last {analytics.overview.activePeriod}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === "7" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("7")}
          >
            7 Days
          </Button>
          <Button
            variant={period === "30" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("30")}
          >
            30 Days
          </Button>
          <Button
            variant={period === "90" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("90")}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.overview.totalAdmins} admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.overview.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ${analytics.overview.avgTransactionValue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.totalPointsRedeemed.toLocaleString()} redeemed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.rewards.totalRewards}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.rewards.totalUsage} redemptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Daily Activity
            </CardTitle>
            <CardDescription>Transactions and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.dailyActivity.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.transactions} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${day.revenue.toFixed(2)}</p>
                    <p className="text-sm text-green-600">+{day.pointsIssued} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Performance
            </CardTitle>
            <CardDescription>Transactions by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.locationStats)
                .sort(([,a], [,b]) => b - a)
                .map(([location, count]) => (
                  <div key={location} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{location}</span>
                    </div>
                    <Badge variant="secondary">{count} transactions</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Top Customers by Points
          </CardTitle>
          <CardDescription>Most engaged customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topCustomers.map((customer, index) => (
              <div key={customer.userId} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">Customer #{customer.userId.slice(-6)}</p>
                    <p className="text-sm text-muted-foreground">ID: {customer.userId}</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {customer.points.toLocaleString()} points
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
