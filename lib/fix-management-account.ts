import { prisma } from "./db"
import bcrypt from "bcryptjs"

export async function fixManagementAccount() {
  try {
    console.log("🔧 Fixing management account...")
    
    // Find the management account
    const managementAccount = await prisma.user.findUnique({
      where: { email: "shawn@management.com" }
    })

    if (!managementAccount) {
      console.log("❌ Management account not found!")
      return
    }

    console.log("✅ Management account found, updating with complete data...")
    
    // Hash password
    const passwordHash = await bcrypt.hash("account123", 10)

    // Update the management account with complete data
    const updatedUser = await prisma.user.update({
      where: { email: "shawn@management.com" },
      data: {
        name: "Shawn Management",
        role: "management",
        passwordHash,
        picture: null
      }
    })

    console.log("✅ Management account updated successfully!")
    console.log("   Email:", updatedUser.email)
    console.log("   Name:", updatedUser.name)
    console.log("   Role:", updatedUser.role)
    console.log("   Tenant ID:", updatedUser.tenantId)
    console.log("   Picture:", updatedUser.picture)
    
  } catch (error) {
    console.error("❌ Error fixing management account:", error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  fixManagementAccount()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
