"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const coffeeItems = [
  { name: "Espresso", price: 3.50 },
  { name: "Cappuccino", price: 4.50 },
  { name: "Latte", price: 4.75 },
  { name: "Americano", price: 3.75 },
  { name: "Mocha", price: 5.00 },
  { name: "Flat White", price: 4.25 },
]

const locations = [
  "Harare CBD",
  "Bulawayo Center", 
  "Victoria Falls Town",
  "Mutare Central",
  "Online Order",
]

const paymentMethods = [
  "Credit Card",
  "Cash",
  "Mobile Money",
  "Bank Transfer",
]

export function PurchaseForm() {
  const [selectedItem, setSelectedItem] = useState("")
  const [location, setLocation] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const selectedItemData = coffeeItems.find(item => item.name === selectedItem)

  const handlePurchase = async () => {
    if (!selectedItem || !location || !paymentMethod) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          itemName: selectedItem,
          amount: selectedItemData!.price,
          location,
          paymentMethod,
        }),
      })

      const data = await res.json()
      if (!data.ok) {
        setError(data.error || "Purchase failed")
      } else {
        toast({
          title: "Purchase Successful!",
          description: data.message,
        })
        // Reset form
        setSelectedItem("")
        setLocation("")
        setPaymentMethod("")
      }
    } catch {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Make a Purchase</CardTitle>
        <CardDescription>Buy coffee and earn loyalty points automatically</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item">Select Item</Label>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your coffee" />
            </SelectTrigger>
            <SelectContent>
              {coffeeItems.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name} - ${item.price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Where did you purchase?" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="How did you pay?" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedItemData && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span>Item:</span>
              <span className="font-medium">{selectedItemData.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-medium">${selectedItemData.price}</span>
            </div>
            <div className="flex justify-between">
              <span>Points Earned:</span>
              <span className="font-medium text-green-600">
                {Math.round(selectedItemData.price * 2)} points
              </span>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handlePurchase} 
          disabled={loading || !selectedItem || !location || !paymentMethod}
          className="w-full"
        >
          {loading ? "Processing..." : "Complete Purchase"}
        </Button>
      </CardContent>
    </Card>
  )
}
