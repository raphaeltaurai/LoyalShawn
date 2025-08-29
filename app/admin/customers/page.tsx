"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Plus, 
  Minus, 
  DollarSign, 
  Calendar,
  Loader2,
  ArrowLeft
} from "lucide-react"

interface CustomerData {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  points: number
  totalSpent: number
  visitCount: number
  joinDate: string
  lastVisit: string
  tier: string
}

export default function AdminCustomersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pointsAdjustment, setPointsAdjustment] = useState<{
    userId: string
    amount: string
    reason: string
  } | null>(null)
  const [adjusting, setAdjusting] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("loyalty-token")
        const res = await fetch(`/api/users?tenantId=${user?.tenantId || ""}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        const data = await res.json()
        if (data.ok) {
          // Fetch customer data for each user
          const customerDataPromises = data.users.map(async (user: any) => {
            const customerRes = await fetch(`/api/users/${user.id}?tenantId=${user.tenantId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            const customerData = await customerRes.json()
            return customerData.ok ? customerData.customer : user
          })
          
          const customerData = await Promise.all(customerDataPromises)
          setCustomers(customerData)
        }
      } catch {
        setError("Failed to load customers")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.tenantId])

  const handlePointsAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pointsAdjustment || !user) return

    setAdjusting(pointsAdjustment.userId)
    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/users/points", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: pointsAdjustment.userId,
          pointsAdjustment: Number(pointsAdjustment.amount),
          reason: pointsAdjustment.reason
        }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error || "Failed to adjust points")
      } else {
        toast({ title: "Success", description: data.message })
        // Refresh the customers list
        const refreshRes = await fetch(`/api/users?tenantId=${user?.tenantId || ""}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
        const refreshData = await refreshRes.json()
        if (refreshData.ok) {
          const customerDataPromises = refreshData.users.map(async (user: any) => {
            const customerRes = await fetch(`/api/users/${user.id}?tenantId=${user.tenantId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            const customerData = await customerRes.json()
            return customerData.ok ? customerData.customer : user
          })
          
          const customerData = await Promise.all(customerDataPromises)
          setCustomers(customerData)
        }
        setPointsAdjustment(null)
      }
    } catch {
      setError("Server error")
    } finally {
      setAdjusting(null)
    }
  }

  if (loading) return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  )

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
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">
              Manage customer accounts and points
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Customers
          </CardTitle>
          <CardDescription>Tenant customers and points management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{customer.name || customer.email}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {customer.tier}
                    </Badge>
                    <Badge variant="secondary">
                      {customer.points} pts
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">${customer.totalSpent.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{customer.visitCount} visits</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPointsAdjustment({ 
                    userId: customer.id, 
                    amount: "", 
                    reason: "" 
                  })}
                >
                  Adjust Points
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {pointsAdjustment && (
        <Card>
          <CardHeader>
            <CardTitle>Adjust Customer Points</CardTitle>
            <CardDescription>Add or subtract points from customer account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePointsAdjustment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="amount">Points Adjustment</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="amount"
                      type="number"
                      value={pointsAdjustment.amount}
                      onChange={(e) => setPointsAdjustment({ 
                        ...pointsAdjustment, 
                        amount: e.target.value 
                      })}
                      placeholder="+100 or -50"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use positive numbers to add, negative to subtract
                  </p>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={pointsAdjustment.reason}
                    onChange={(e) => setPointsAdjustment({ 
                      ...pointsAdjustment, 
                      reason: e.target.value 
                    })}
                    placeholder="e.g., Customer service adjustment"
                    required
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button 
                    type="submit" 
                    disabled={adjusting === pointsAdjustment.userId}
                    className="flex-1"
                  >
                    {adjusting === pointsAdjustment.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <DollarSign className="h-4 w-4 mr-2" />
                    )}
                    Apply
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setPointsAdjustment(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


