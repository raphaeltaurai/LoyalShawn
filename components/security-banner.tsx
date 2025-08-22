"use client"

import { Shield, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { Badge } from "./ui/badge"
import { useSecurity } from "@/hooks/use-security"

export function SecurityBanner() {
  const { securityContext, isAdmin } = useSecurity()

  if (!securityContext) return null

  return (
    <Alert className="mb-4">
      <Shield className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>Secure multi-tenant environment</span>
          <Badge variant="outline">Tenant: {securityContext.tenantId}</Badge>
          <Badge variant={isAdmin ? "default" : "secondary"}>{securityContext.role}</Badge>
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <AlertTriangle className="h-3 w-3" />
          <span>All actions are audited</span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
