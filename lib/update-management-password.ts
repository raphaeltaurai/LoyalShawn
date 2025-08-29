import { prisma } from "./db"
import bcrypt from "bcryptjs"

export async function updateManagementPassword() {
  try {
    // Find the management account
    const managementAccount = await prisma.user.findUnique({
      where: { email: "shawn@management.com" }
    })

    if (!managementAccount) {
      console.log("Management account not found. Creating it...")
      
      // Create management tenant
      const managementTenant = await prisma.tenant.upsert({
        where: { slug: "management" },
        update: {},
        create: {
          slug: "management",
          name: "Management System"
        }
      })

      // Hash password
      const passwordHash = await bcrypt.hash("account123", 10)

      // Create management user
      const managementUser = await prisma.user.create({
        data: {
          email: "shawn@management.com",
          name: "Shawn Management",
          role: "management",
          passwordHash,
          tenantId: managementTenant.id
        }
      })

      console.log("Management account created successfully:", managementUser.email)
    } else {
      console.log("Management account found. Updating password...")
      
      // Hash new password
      const passwordHash = await bcrypt.hash("account123", 10)

      // Update the password
      const updatedUser = await prisma.user.update({
        where: { email: "shawn@management.com" },
        data: {
          passwordHash,
          role: "management" // Ensure role is correct
        }
      })

      console.log("Management account password updated successfully:", updatedUser.email)
    }
  } catch (error) {
    console.error("Error updating management account:", error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  updateManagementPassword()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
