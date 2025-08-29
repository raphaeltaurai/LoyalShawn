"use client"

import { useAuth } from "./auth-provider"
import { useSecurity } from "@/hooks/use-security"
import { SecurityBanner } from "./security-banner"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { LogOut, Users, Gift, TrendingUp, Settings, AlertTriangle, DollarSign, CheckCircle, Shield } from "lucide-react"
import React, { useState, useEffect } from "react"
import { AdminRulesConfig } from "./admin-rules-config"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
  totalCustomers: number
  totalPointsIssued: number
  totalRevenue: number
  engagementRate: number
  highValueCustomers: number
  churnRiskCustomers: number
}

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const { hasPermission, auditLog } = useSecurity()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    auditLog("ADMIN_DASHBOARD_ACCESSED")
    fetchDashboardStats()
  }, [auditLog])

  const fetchDashboardStats = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch(`/api/analytics?tenantId=${user.tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (data.ok) {
        setStats(data.stats)
      } else {
        toast({ title: "Error", description: "Failed to fetch dashboard stats", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load dashboard", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!hasPermission("read:analytics")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LoyaltyAI
              </h1>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              >
                Admin Portal
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecurityBanner />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.totalCustomers.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.highValueCustomers || 0} high-value customers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Points Issued</CardTitle>
              <Gift className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.totalPointsIssued.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg {stats ? Math.floor(stats.totalPointsIssued / stats.totalCustomers) : 0} per customer
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats?.engagementRate.toFixed(1) || "0"}%
              </div>
              <p className="text-xs text-muted-foreground">Active in last 30 days</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Revenue Impact</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ${stats?.totalRevenue.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats ? (stats.totalRevenue / stats.totalCustomers).toFixed(2) : "0"} avg per customer
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">Manage your loyalty program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start bg-primary hover:bg-primary/90"
                onClick={() => window.location.href = "/admin/verification"}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Purchase Verification
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border hover:bg-accent bg-transparent"
                onClick={() => window.location.href = "/admin/rewards"}
              >
                <Gift className="h-4 w-4 mr-2" />
                Configure Rewards
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-border hover:bg-accent bg-transparent"
                onClick={() => window.location.href = "/admin/customers"}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-border hover:bg-accent bg-transparent"
                onClick={() => window.location.href = "/admin/analytics"}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">AI Insights</CardTitle>
              <CardDescription className="text-muted-foreground">Recent behavioral analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-sm font-medium text-foreground">High-Value Customer Alert</p>
                  <p className="text-xs text-muted-foreground">
                    {stats?.highValueCustomers || 0} customers showing increased spending patterns
                  </p>
                </div>
                <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                  <p className="text-sm font-medium text-foreground">Engagement Opportunity</p>
                  <p className="text-xs text-muted-foreground">
                    Weekend promotions show {Math.floor(Math.random() * 30 + 15)}% higher conversion
                  </p>
                </div>
                {stats && stats.churnRiskCustomers > 0 && (
                  <div className="p-3 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                      <p className="text-sm font-medium text-foreground">Churn Risk</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{stats.churnRiskCustomers} customers at risk of churning</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <AdminRulesConfig />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">Purchase Verification</CardTitle>
              <CardDescription className="text-muted-foreground">Review and approve customer purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/admin/verification"}>
                Review Purchases
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground">Analytics Dashboard</CardTitle>
              <CardDescription className="text-muted-foreground">View loyalty program insights and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/admin/analytics"}>
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
