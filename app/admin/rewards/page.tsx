"use client"

import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2,
  ArrowLeft
} from "lucide-react"

export default function RewardsPage() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return <div className="p-6">Access denied</div>
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
            <h1 className="text-3xl font-bold">Rewards Configuration</h1>
            <p className="text-muted-foreground">
              Manage your loyalty program rewards
            </p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add New Reward
        </Button>
      </div>

      {/* Current Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Free Coffee</CardTitle>
              <Badge variant="secondary">500 pts</Badge>
            </div>
            <CardDescription className="text-muted-foreground">
              Any size coffee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">Beverages</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage Count:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">10% Off</CardTitle>
              <Badge variant="secondary">200 pts</Badge>
            </div>
            <CardDescription className="text-muted-foreground">
              Valid 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">Discounts</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage Count:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Settings */}
      <Card className="bg-card border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <Gift className="h-5 w-5 mr-2" />
            Program Settings
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure your loyalty program parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Points per Dollar</label>
              <div className="text-2xl font-bold text-primary">2</div>
              <p className="text-xs text-muted-foreground">Points earned per dollar spent</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Birthday Bonus</label>
              <div className="text-2xl font-bold text-primary">250</div>
              <p className="text-xs text-muted-foreground">Bonus points on customer birthday</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-in Bonus</label>
              <div className="text-2xl font-bold text-primary">50</div>
              <p className="text-xs text-muted-foreground">Points for location check-ins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
