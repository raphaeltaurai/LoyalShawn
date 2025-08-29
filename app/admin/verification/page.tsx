"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin, 
  DollarSign,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Purchase {
  id: string
  userId: string
  tenantId: string
  location: string
  amount: number
  items: string
  timestamp: string
  status: string
  pointsAwarded: number
  user: {
    id: string
    name: string
    email: string
  }
}

export default function PurchaseVerificationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchPendingPurchases = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch(`/api/purchases?tenantId=${user.tenantId}&status=pending`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (data.ok) {
        setPurchases(data.purchases)
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch purchases", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (purchaseId: string, action: "approve" | "decline") => {
    setProcessing(purchaseId)

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/purchases/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ purchaseId, action })
      })

      const data = await res.json()
      
      if (data.ok) {
        toast({ 
          title: "Success", 
          description: data.message 
        })
        // Remove the processed purchase from the list
        setPurchases(prev => prev.filter(p => p.id !== purchaseId))
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to process verification", variant: "destructive" })
    } finally {
      setProcessing(null)
    }
  }

  useEffect(() => {
    fetchPendingPurchases()
  }, [user])

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
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
            <h1 className="text-3xl font-bold">Purchase Verification</h1>
            <p className="text-muted-foreground">
              Review and approve customer purchase records
            </p>
          </div>
        </div>
        <Button onClick={fetchPendingPurchases} variant="outline">
          Refresh
        </Button>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">No pending purchases</p>
              <p className="text-muted-foreground">All purchase records have been processed</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const items = JSON.parse(purchase.items || "[]")
            
            return (
              <Card key={purchase.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <div>
                        <CardTitle className="text-lg">Purchase Record</CardTitle>
                        <CardDescription>
                          Submitted on {new Date(purchase.timestamp).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{purchase.user.name}</p>
                      <p className="text-sm text-muted-foreground">{purchase.user.email}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{purchase.location}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Total Amount</p>
                      <p className="text-sm text-muted-foreground">${purchase.amount.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    <p className="font-medium">Purchase Items:</p>
                    <div className="space-y-2">
                      {items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.price.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={() => handleVerification(purchase.id, "approve")}
                      disabled={processing === purchase.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processing === purchase.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVerification(purchase.id, "decline")}
                      disabled={processing === purchase.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processing === purchase.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
