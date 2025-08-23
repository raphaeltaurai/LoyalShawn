"use client"

import { useAuth } from "@/components/auth-provider"
import { SecurityManager, type SecurityContext } from "@/lib/security"
import { useMemo } from "react"

export function useSecurity() {
  const { user } = useAuth()

  const securityContext: SecurityContext | null = useMemo(() => {
    if (!user) return null

    return {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      permissions: SecurityManager.getPermissions(user.role),
    }
  }, [user])

  const hasPermission = (permission: string): boolean => {
    if (!securityContext) return false
    return SecurityManager.hasPermission(securityContext, permission)
  }

  const validateTenantAccess = (resourceTenantId: string): boolean => {
    if (!securityContext) return false
    return SecurityManager.validateTenantAccess(securityContext.tenantId, resourceTenantId)
  }

  const sanitizeData = (data: any, type: "customer" | "transaction" | "reward") => {
    if (!securityContext) return null

    switch (type) {
      case "customer":
        return SecurityManager.sanitizeCustomerData(data, securityContext)
      default:
        return data
    }
  }

  const auditLog = (action: string, details?: any) => {
    if (securityContext) {
      SecurityManager.auditLog(action, securityContext, details)
    }
  }

  return {
    securityContext,
    hasPermission,
    validateTenantAccess,
    sanitizeData,
    auditLog,
    isAdmin: securityContext?.role === "admin",
    isCustomer: securityContext?.role === "customer",
  }
}
