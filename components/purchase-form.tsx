"use client"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useDatabase } from "@/hooks/use-database"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Plus, Trash2, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PurchaseItem {
  name: string
  category: string
  price: number
  quantity: number
}

export function PurchaseForm() {
  const { user } = useAuth()
  const { createPurchase, geofences } = useDatabase()
  const { toast } = useToast()
  const [selectedTenant, setSelectedTenant] = useState("")
  const [location, setLocation] = useState("")
  const [items, setItems] = useState<PurchaseItem[]>([
    { name: "", category: "", price: 0, quantity: 1 }
  ])
  const [submitting, setSubmitting] = useState(false)

  const addItem = () => {
    setItems([...items, { name: "", category: "", price: 0, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to record a purchase", variant: "destructive" })
      return
    }

    if (!selectedTenant) {
      toast({ title: "Error", description: "Please select an organization", variant: "destructive" })
      return
    }

    if (!location) {
      toast({ title: "Error", description: "Please enter a location", variant: "destructive" })
      return
    }

    if (items.some(item => !item.name || item.price <= 0)) {
      toast({ title: "Error", description: "Please fill in all item details correctly", variant: "destructive" })
      return
    }

    setSubmitting(true)

    try {
      const result = await createPurchase({
        tenantId: selectedTenant,
          location,
        amount: calculateTotal(),
        items
      })

      if (result.success) {
        toast({ title: "Success", description: result.message })
        // Reset form
        setSelectedTenant("")
        setLocation("")
        setItems([{ name: "", category: "", price: 0, quantity: 1 }])
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to record purchase", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="bg-card border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
          Record a Purchase
        </CardTitle>
        <CardDescription>
          Record your purchase for points approval by the organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Selection */}
        <div className="space-y-2">
            <Label htmlFor="tenant">Select Organization/Shop</Label>
            <select
              id="tenant"
              name="tenant"
              aria-label="Select organization"
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
              required
            >
              <option value="">Choose an organization...</option>
              <option value={user?.tenantId || ""}>
                {user?.tenantId === "coffee-shop-1" ? "Coffee Shop" : user?.tenantId}
              </option>
            </select>
        </div>

          {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
            <select
              id="location"
              name="location"
              aria-label="Select location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
              required
            >
              <option value="">Select a location...</option>
              {geofences.map((fence) => (
                <option key={fence.id} value={fence.name}>
                  {fence.name}
                </option>
              ))}
            </select>
        </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Purchase Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
        </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border border-border rounded-lg">
                <div>
                  <Label htmlFor={`item-${index}-name`}>Item Name</Label>
                  <Input
                    id={`item-${index}-name`}
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder="e.g., Large Latte"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`item-${index}-category`}>Category</Label>
                  <Input
                    id={`item-${index}-category`}
                    value={item.category}
                    onChange={(e) => updateItem(index, "category", e.target.value)}
                    placeholder="e.g., Beverages"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`item-${index}-price`}>Price ($)</Label>
                  <Input
                    id={`item-${index}-price`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
            </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor={`item-${index}-quantity`}>Qty</Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                      required
                    />
            </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
            </div>
          </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="font-medium">Total Amount:</span>
            <Badge variant="secondary" className="text-lg">
              ${calculateTotal().toFixed(2)}
            </Badge>
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <Label>Timestamp</Label>
            <Input
              value={new Date().toLocaleString()}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Submit Button */}
        <Button 
            type="submit"
          className="w-full"
            disabled={submitting}
        >
            {submitting ? "Recording Purchase..." : "Submit Record"}
        </Button>
        </form>
      </CardContent>
    </Card>
  )
}
