"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useLoyaltyEngine } from "@/hooks/use-loyalty-engine"
import { useToast } from "@/hooks/use-toast"

export function AdminRulesConfig() {
  const { getProgram, updateProgramRules } = useLoyaltyEngine()
  const program = getProgram()
  const [checkInBonus, setCheckInBonus] = useState<number>(program.rules.checkInBonusPoints ?? 50)
  const [checkInRadius, setCheckInRadius] = useState<number>(program.rules.checkInRadiusMeters ?? 150)
  const [birthdayBonus, setBirthdayBonus] = useState<number>(program.rules.birthdayBonus)
  const { toast } = useToast()

  const save = () => {
    updateProgramRules({
      checkInBonusPoints: Number(checkInBonus) || 0,
      checkInRadiusMeters: Number(checkInRadius) || 0,
      birthdayBonus: Number(birthdayBonus) || 0,
    })
    toast({ title: "Rules updated", description: "Program rules saved successfully" })
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">Program Rules</CardTitle>
        <CardDescription className="text-muted-foreground">Configure check-in and bonus rules</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="checkin-bonus">Check-in bonus points</Label>
          <Input id="checkin-bonus" type="number" value={checkInBonus} onChange={(e) => setCheckInBonus(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkin-radius">Check-in radius (m)</Label>
          <Input id="checkin-radius" type="number" value={checkInRadius} onChange={(e) => setCheckInRadius(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bday-bonus">Birthday bonus points</Label>
          <Input id="bday-bonus" type="number" value={birthdayBonus} onChange={(e) => setBirthdayBonus(Number(e.target.value))} />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <Button onClick={save}>Save Rules</Button>
        </div>
      </CardContent>
    </Card>
  )
}


