import { prisma } from "./db"

export async function checkManagementAccount() {
  try {
    // Find the management account
    const managementAccount = await prisma.user.findUnique({
      where: { email: "shawn@management.com" },
      include: {
        tenant: true
      }
    })

    if (!managementAccount) {
      console.log("❌ Management account not found!")
      return
    }

    console.log("✅ Management account found:")
    console.log("   Email:", managementAccount.email)
    console.log("   Name:", managementAccount.name)
    console.log("   Role:", managementAccount.role)
    console.log("   Tenant:", managementAccount.tenant.name)
    console.log("   Created:", managementAccount.createdAt)
    console.log("   Password Hash:", managementAccount.passwordHash ? "✅ Set" : "❌ Not set")

    // Also check if the management tenant exists
    const managementTenant = await prisma.tenant.findUnique({
      where: { slug: "management" }
    })

    if (managementTenant) {
      console.log("✅ Management tenant found:", managementTenant.name)
    } else {
      console.log("❌ Management tenant not found!")
    }

  } catch (error) {
    console.error("Error checking management account:", error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  checkManagementAccount()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
