import { prisma } from "./db"

export async function debugManagementUser() {
  try {
    console.log("🔍 Debugging management user...")
    
    // Get the management user with all fields
    const user = await prisma.user.findUnique({
      where: { email: "shawn@management.com" },
      include: {
        tenant: true
      }
    })

    if (!user) {
      console.log("❌ User not found!")
      return
    }

    console.log("📋 Raw user data from database:")
    console.log(JSON.stringify(user, null, 2))
    
    console.log("\n🔍 Field analysis:")
    console.log("   id:", user.id ? "✅ Present" : "❌ Missing")
    console.log("   email:", user.email ? "✅ Present" : "❌ Missing")
    console.log("   name:", user.name ? "✅ Present" : "❌ Missing")
    console.log("   role:", user.role ? "✅ Present" : "❌ Missing")
    console.log("   tenantId:", user.tenantId ? "✅ Present" : "❌ Missing")
    console.log("   picture:", user.picture ? "✅ Present" : "❌ Missing")
    console.log("   passwordHash:", user.passwordHash ? "✅ Present" : "❌ Missing")
    
    // Test the exact response that the API would return
    const apiResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      picture: user.picture
    }
    
    console.log("\n📤 API Response object:")
    console.log(JSON.stringify(apiResponse, null, 2))
    
  } catch (error) {
    console.error("❌ Error debugging user:", error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  debugManagementUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
