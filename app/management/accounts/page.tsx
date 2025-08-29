"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  tenant: {
    id: string
    name: string
    slug: string
  }
}

export default function AccountManagementPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/management/accounts", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (data.ok) {
        setUsers(data.users)
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "customer") => {
    setProcessing(userId)

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/management/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, newRole })
      })

      const data = await res.json()
      
      if (data.ok) {
        toast({ 
          title: "Success", 
          description: data.message 
        })
        // Update the user in the list
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ))
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user role", variant: "destructive" })
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (!user || user.role !== "management") {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">Management access required.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  const adminUsers = users.filter(u => u.role === "admin")
  const customerUsers = users.filter(u => u.role === "customer")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Account Management</h1>
            <p className="text-muted-foreground">
              Manage user roles across all tenants
            </p>
          </div>
        </div>
        <Button onClick={fetchUsers} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Tenant administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Loyalty program members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Users
          </CardTitle>
          <CardDescription>
            Users with administrative privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Tenant: {user.tenant.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Admin
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleChange(user.id, "customer")}
                    disabled={processing === user.id}
                  >
                    {processing === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {adminUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No admin users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Customer Users
          </CardTitle>
          <CardDescription>
            Regular loyalty program members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Tenant: {user.tenant.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Customer</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleChange(user.id, "admin")}
                    disabled={processing === user.id}
                  >
                    {processing === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {customerUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No customer users found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
