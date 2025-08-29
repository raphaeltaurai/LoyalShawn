import { prisma } from "./db"
import bcrypt from "bcryptjs"

export async function createManagementAccount() {
  try {
    // Check if management account already exists
    const existingAccount = await prisma.user.findUnique({
      where: { email: "shawn@management.com" }
    })

    if (existingAccount) {
      console.log("Management account already exists")
      return
    }

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
  } catch (error) {
    console.error("Error creating management account:", error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createManagementAccount()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
