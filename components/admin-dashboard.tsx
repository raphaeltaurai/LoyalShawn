"use client"

import { useAuth } from "./auth-wrapper"
import { useLoyaltyEngine } from "@/hooks/use-loyalty-engine"
import { useSecurity } from "@/hooks/use-security"
import { SecurityBanner } from "./security-banner"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { LogOut, Users, Gift, TrendingUp, Settings, AlertTriangle, DollarSign } from "lucide-react"
import React from "react"

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const { customers, transactions, rewards, getCustomerAnalytics } = useLoyaltyEngine()
  const { hasPermission, auditLog } = useSecurity()

  React.useEffect(() => {
    auditLog("ADMIN_DASHBOARD_ACCESSED")
  }, [auditLog])

  const totalCustomers = customers.length
  const totalPointsIssued = transactions.reduce((sum, t) => sum + t.pointsEarned, 0)
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)
  const avgTransactionValue = totalRevenue / transactions.length || 0

  const highValueCustomers = customers.filter((c) => c.totalSpent > 1000).length
  const churnRiskCustomers = customers.filter((c) => {
    const analytics = getCustomerAnalytics(c.id)
    return analytics?.churnRisk === "high"
  }).length

  const engagementRate =
    (customers.filter((c) => {
      const daysSinceLastVisit = Math.floor(
        (new Date().getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
      )
      return daysSinceLastVisit <= 30
    }).length /
      totalCustomers) *
    100

  if (!hasPermission("read:analytics")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">LoyaltyAI</h1>
              <Badge variant="secondary">Admin Portal</Badge>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecurityBanner />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{highValueCustomers} high-value customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPointsIssued.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg {Math.floor(totalPointsIssued / totalCustomers)} per customer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{engagementRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Active in last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">${avgTransactionValue.toFixed(2)} avg transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your loyalty program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configure Rewards
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Recent behavioral analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium">High-Value Customer Alert</p>
                  <p className="text-xs text-muted-foreground">
                    {highValueCustomers} customers showing increased spending patterns
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium">Engagement Opportunity</p>
                  <p className="text-xs text-muted-foreground">
                    Weekend promotions show {Math.floor(Math.random() * 30 + 15)}% higher conversion
                  </p>
                </div>
                {churnRiskCustomers > 0 && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                      <p className="text-sm font-medium">Churn Risk</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{churnRiskCustomers} customers at risk of churning</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Insights Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Top customers and their analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.slice(0, 5).map((customer) => {
                const analytics = getCustomerAnalytics(customer.id)
                return (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {customer.tier}
                      </Badge>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm font-medium">{customer.points.toLocaleString()} pts</p>
                          <p className="text-xs text-muted-foreground">${customer.totalSpent.toFixed(0)} spent</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{customer.visitCount} visits</p>
                          <p className="text-xs text-muted-foreground">
                            LTV: ${analytics?.lifetimeValue.toFixed(0) || "0"}
                          </p>
                        </div>
                        {analytics && (
                          <Badge
                            variant={
                              analytics.churnRisk === "high"
                                ? "destructive"
                                : analytics.churnRisk === "medium"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {analytics.churnRisk} risk
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
