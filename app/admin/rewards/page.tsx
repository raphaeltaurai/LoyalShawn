"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash2,
  ArrowLeft,
  Save,
  X,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  category: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  expiryDate?: string
}

interface ProgramSettings {
  pointsPerDollar: number
  birthdayBonus: number
  checkInBonusPoints: number
  checkInRadiusMeters: number
}

export default function RewardsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [programSettings, setProgramSettings] = useState<ProgramSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [editingSettings, setEditingSettings] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    pointsCost: 0,
    category: "",
    isActive: true,
    usageLimit: undefined as number | undefined,
    expiryDate: ""
  })

  const [tempSettings, setTempSettings] = useState<ProgramSettings>({
    pointsPerDollar: 2,
    birthdayBonus: 250,
    checkInBonusPoints: 50,
    checkInRadiusMeters: 150
  })

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem("loyalty-token")
      
      // Fetch rewards
      const rewardsRes = await fetch(`/api/rewards?tenantId=${user.tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const rewardsData = await rewardsRes.json()
      
      if (rewardsData.ok) {
        setRewards(rewardsData.rewards)
      }

      // Fetch program settings
      const programRes = await fetch(`/api/programs?tenantId=${user.tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const programData = await programRes.json()
      
      if (programData.ok) {
        setProgramSettings(programData.program)
        setTempSettings(programData.program)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tenantId: user?.tenantId,
          ...newReward,
          usageLimit: newReward.usageLimit || undefined,
          expiryDate: newReward.expiryDate || undefined
        })
      })

      const data = await res.json()
      if (data.ok) {
        toast({ title: "Success", description: "Reward created successfully" })
        setShowCreateForm(false)
        setNewReward({
          name: "",
          description: "",
          pointsCost: 0,
          category: "",
          isActive: true,
          usageLimit: undefined,
          expiryDate: ""
        })
        fetchData()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create reward", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateReward = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReward) return
    setProcessing(true)

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/rewards", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingReward.id,
          name: editingReward.name,
          description: editingReward.description,
          pointsCost: editingReward.pointsCost,
          category: editingReward.category,
          isActive: editingReward.isActive,
          usageLimit: editingReward.usageLimit,
          expiryDate: editingReward.expiryDate
        })
      })

      const data = await res.json()
      if (data.ok) {
        toast({ title: "Success", description: "Reward updated successfully" })
        setEditingReward(null)
        fetchData()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update reward", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch(`/api/rewards?id=${rewardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      if (data.ok) {
        toast({ title: "Success", description: "Reward deleted successfully" })
        fetchData()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete reward", variant: "destructive" })
    }
  }

  const handleUpdateSettings = async () => {
    setProcessing(true)

    try {
      const token = localStorage.getItem("loyalty-token")
      const res = await fetch("/api/programs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tenantId: user?.tenantId,
          ...tempSettings
        })
      })

      const data = await res.json()
      if (data.ok) {
        toast({ title: "Success", description: "Program settings updated successfully" })
        setEditingSettings(false)
        setProgramSettings(tempSettings)
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" })
    } finally {
      setProcessing(false)
    }
  }

  if (!user || user.role !== "admin") {
    return <div className="p-6">Access denied</div>
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
            <h1 className="text-3xl font-bold">Rewards Configuration</h1>
            <p className="text-muted-foreground">
              Manage your loyalty program rewards
            </p>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Reward
        </Button>
      </div>

      {/* Create/Edit Reward Form */}
      {(showCreateForm || editingReward) && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingReward ? "Edit Reward" : "Create New Reward"}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingReward(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingReward ? handleUpdateReward : handleCreateReward} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Reward Name</Label>
                  <Input
                    id="name"
                    value={editingReward?.name || newReward.name}
                    onChange={(e) => editingReward 
                      ? setEditingReward({ ...editingReward, name: e.target.value })
                      : setNewReward({ ...newReward, name: e.target.value })
                    }
                    placeholder="e.g., Free Coffee"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingReward?.category || newReward.category}
                    onChange={(e) => editingReward
                      ? setEditingReward({ ...editingReward, category: e.target.value })
                      : setNewReward({ ...newReward, category: e.target.value })
                    }
                    placeholder="e.g., Beverages"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingReward?.description || newReward.description}
                  onChange={(e) => editingReward
                    ? setEditingReward({ ...editingReward, description: e.target.value })
                    : setNewReward({ ...newReward, description: e.target.value })
                  }
                  placeholder="Describe the reward..."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pointsCost">Points Cost</Label>
                  <Input
                    id="pointsCost"
                    type="number"
                    min="1"
                    value={editingReward?.pointsCost || newReward.pointsCost}
                    onChange={(e) => editingReward
                      ? setEditingReward({ ...editingReward, pointsCost: parseInt(e.target.value) })
                      : setNewReward({ ...newReward, pointsCost: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={editingReward?.usageLimit || newReward.usageLimit || ""}
                    onChange={(e) => editingReward
                      ? setEditingReward({ ...editingReward, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })
                      : setNewReward({ ...newReward, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={editingReward?.expiryDate || newReward.expiryDate}
                    onChange={(e) => editingReward
                      ? setEditingReward({ ...editingReward, expiryDate: e.target.value })
                      : setNewReward({ ...newReward, expiryDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={processing}>
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingReward ? "Update Reward" : "Create Reward"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingReward(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="bg-card border-border/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">{reward.name}</CardTitle>
                <Badge variant="secondary">{reward.pointsCost} pts</Badge>
              </div>
              <CardDescription className="text-muted-foreground">
                {reward.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{reward.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage Count:</span>
                  <span className="font-medium">{reward.usageCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={reward.isActive ? "default" : "secondary"} className={reward.isActive ? "bg-green-100 text-green-800" : ""}>
                    {reward.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingReward(reward)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeleteReward(reward.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Program Settings */}
      <Card className="bg-card border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center">
              <Gift className="h-5 w-5 mr-2" />
              Program Settings
            </div>
            {!editingSettings ? (
              <Button variant="outline" size="sm" onClick={() => setEditingSettings(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleUpdateSettings} disabled={processing}>
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditingSettings(false)
                    setTempSettings(programSettings || tempSettings)
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure your loyalty program parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
              {editingSettings ? (
                <Input
                  id="pointsPerDollar"
                  type="number"
                  min="1"
                  value={tempSettings.pointsPerDollar}
                  onChange={(e) => setTempSettings({ ...tempSettings, pointsPerDollar: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-2xl font-bold text-primary">{programSettings?.pointsPerDollar || 2}</div>
              )}
              <p className="text-xs text-muted-foreground">Points earned per dollar spent</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthdayBonus">Birthday Bonus</Label>
              {editingSettings ? (
                <Input
                  id="birthdayBonus"
                  type="number"
                  min="0"
                  value={tempSettings.birthdayBonus}
                  onChange={(e) => setTempSettings({ ...tempSettings, birthdayBonus: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-2xl font-bold text-primary">{programSettings?.birthdayBonus || 250}</div>
              )}
              <p className="text-xs text-muted-foreground">Bonus points on customer birthday</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkInBonus">Check-in Bonus</Label>
              {editingSettings ? (
                <Input
                  id="checkInBonus"
                  type="number"
                  min="0"
                  value={tempSettings.checkInBonusPoints}
                  onChange={(e) => setTempSettings({ ...tempSettings, checkInBonusPoints: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-2xl font-bold text-primary">{programSettings?.checkInBonusPoints || 50}</div>
              )}
              <p className="text-xs text-muted-foreground">Points for location check-ins</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkInRadius">Check-in Radius (m)</Label>
              {editingSettings ? (
                <Input
                  id="checkInRadius"
                  type="number"
                  min="50"
                  value={tempSettings.checkInRadiusMeters}
                  onChange={(e) => setTempSettings({ ...tempSettings, checkInRadiusMeters: parseInt(e.target.value) })}
                />
              ) : (
                <div className="text-2xl font-bold text-primary">{programSettings?.checkInRadiusMeters || 150}</div>
              )}
              <p className="text-xs text-muted-foreground">Radius for location check-ins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
