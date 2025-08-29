"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Users, 
  Settings, 
  ArrowRight,
  Building,
  UserCheck
} from "lucide-react"

export default function ManagementDashboard() {
  const { user, logout } = useAuth()

  if (!user || user.role !== "management") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">Management access required.</p>
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LoyaltyAI Management
              </h1>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              >
                Management Portal
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
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">System Management</h2>
          <p className="text-muted-foreground">
            Manage the entire LoyaltyAI platform and all tenant organizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Account Management */}
          <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Account Management</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage user roles and permissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Promote users to admin roles, manage customer accounts, and control access across all tenants.
              </p>
              <Button 
                className="w-full"
                onClick={() => window.location.href = "/management/accounts"}
              >
                Manage Accounts
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* System Overview */}
          <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-foreground">System Overview</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Platform-wide statistics and insights
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Tenants</span>
                  <Badge variant="secondary">Multiple</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <Badge variant="secondary">All Roles</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Platform Status</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-foreground">System Settings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Platform configuration and security
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure platform-wide settings, security policies, and system parameters.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                disabled
              >
                Coming Soon
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Shield className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Common management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => window.location.href = "/management/accounts"}
                >
                  <div className="text-left">
                    <div className="font-medium">Account Management</div>
                    <div className="text-sm text-muted-foreground">
                      Manage user roles and permissions
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="justify-start h-auto p-4"
                  disabled
                >
                  <div className="text-left">
                    <div className="font-medium">System Analytics</div>
                    <div className="text-sm text-muted-foreground">
                      Platform-wide performance metrics
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Info */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-purple-800 dark:text-purple-200">
                Management Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-purple-700 dark:text-purple-300">
                  <strong>Current User:</strong> {user.email}
                </p>
                <p className="text-purple-700 dark:text-purple-300">
                  <strong>Role:</strong> System Management
                </p>
                <p className="text-purple-700 dark:text-purple-300">
                  <strong>Permissions:</strong> Full system access across all tenants
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
