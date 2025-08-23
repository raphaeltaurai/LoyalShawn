// Security utilities for the loyalty system

export interface SecurityContext {
  userId: string
  tenantId: string
  role: "admin" | "customer"
  permissions: string[]
}

export class SecurityManager {
  // Validate tenant access
  static validateTenantAccess(userTenantId: string, resourceTenantId: string): boolean {
    return userTenantId === resourceTenantId
  }

  // Check if user has required permission
  static hasPermission(context: SecurityContext, permission: string): boolean {
    return context.permissions.includes(permission) || context.permissions.includes("*")
  }

  // Get permissions based on role
  static getPermissions(role: "admin" | "customer"): string[] {
    const permissions = {
      admin: [
        "read:customers",
        "write:customers",
        "read:transactions",
        "write:transactions",
        "read:rewards",
        "write:rewards",
        "read:analytics",
        "write:program_config",
        "read:ai_insights",
      ],
      customer: ["read:own_profile", "write:own_profile", "read:own_transactions", "redeem:rewards", "read:rewards"],
    }
    return permissions[role]
  }

  // Sanitize data based on user context
  static sanitizeCustomerData(customer: any, context: SecurityContext) {
    // Customers can only see their own full data
    if (context.role === "customer" && customer.id !== context.userId) {
      return {
        id: customer.id,
        name: customer.name,
        tier: customer.tier,
      }
    }

    // Admins can see all data within their tenant
    if (context.role === "admin" && this.validateTenantAccess(context.tenantId, customer.tenantId)) {
      return customer
    }

    return null
  }

  // Rate limiting for API calls
  static rateLimiter = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const userLimit = this.rateLimiter.get(identifier)

    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (userLimit.count >= maxRequests) {
      return false
    }

    userLimit.count++
    return true
  }

  // Specialized velocity checks
  static canCheckIn(userId: string): boolean {
    // Allow at most 2 check-ins per 10 minutes
    return this.checkRateLimit(`checkin_${userId}`, 2, 10 * 60 * 1000)
  }

  static canRedeem(userId: string): boolean {
    // Allow at most 3 redemptions per hour
    return this.checkRateLimit(`redeem_${userId}`, 3, 60 * 60 * 1000)
  }

  // Input validation
  static validateInput(input: any, schema: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = input[field]

      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`)
        continue
      }

      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`)
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`)
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters`)
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // Audit logging
  static auditLog(action: string, context: SecurityContext, details?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId: context.userId,
      tenantId: context.tenantId,
      role: context.role,
      details: details || {},
    }

    // In a real app, this would go to a secure audit log
    console.log("[AUDIT]", logEntry)
    try {
      // Fire-and-forget server logging
      fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logEntry),
        keepalive: true,
      }).catch(() => {})
    } catch {
      // ignore
    }
  }
}

// Validation schemas
export const validationSchemas = {
  customer: {
    email: { required: true, type: "string", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    name: { required: true, type: "string", minLength: 2, maxLength: 100 },
    phone: { type: "string", pattern: /^\+?[\d\s\-$$$$]+$/ },
  },
  transaction: {
    amount: { required: true, type: "number" },
    items: { required: true, type: "object" },
    location: { required: true, type: "string", minLength: 1 },
  },
  reward: {
    name: { required: true, type: "string", minLength: 2, maxLength: 100 },
    pointsCost: { required: true, type: "number" },
    description: { required: true, type: "string", minLength: 5, maxLength: 500 },
  },
}
