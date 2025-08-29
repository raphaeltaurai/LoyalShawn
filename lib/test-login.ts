import { prisma } from "./db"
import bcrypt from "bcryptjs"

export async function testLogin() {
  try {
    console.log("🧪 Testing login functionality...")
    
    // Test 1: Check if management account exists
    const managementUser = await prisma.user.findUnique({
      where: { email: "shawn@management.com" }
    })
    
    if (!managementUser) {
      console.log("❌ Management account not found!")
      return
    }
    
    console.log("✅ Management account found:", managementUser.email)
    console.log("   Role:", managementUser.role)
    console.log("   Password Hash:", managementUser.passwordHash ? "✅ Set" : "❌ Not set")
    
    // Test 2: Test password verification
    const testPassword = "account123"
    const isPasswordValid = await bcrypt.compare(testPassword, managementUser.passwordHash!)
    
    console.log("🔐 Password verification test:")
    console.log("   Test password:", testPassword)
    console.log("   Password valid:", isPasswordValid ? "✅ Yes" : "❌ No")
    
    // Test 3: Check admin account
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@coffeeshop.com" }
    })
    
    if (adminUser) {
      console.log("✅ Admin account found:", adminUser.email)
      const adminPasswordValid = await bcrypt.compare("demo123", adminUser.passwordHash!)
      console.log("   Admin password valid:", adminPasswordValid ? "✅ Yes" : "❌ No")
    }
    
    // Test 4: Check customer account
    const customerUser = await prisma.user.findUnique({
      where: { email: "customer@example.com" }
    })
    
    if (customerUser) {
      console.log("✅ Customer account found:", customerUser.email)
      const customerPasswordValid = await bcrypt.compare("demo123", customerUser.passwordHash!)
      console.log("   Customer password valid:", customerPasswordValid ? "✅ Yes" : "❌ No")
    }
    
    console.log("\n📋 Summary:")
    console.log("   Management:", isPasswordValid ? "✅ Ready" : "❌ Issue")
    console.log("   Admin:", adminUser ? "✅ Ready" : "❌ Issue")
    console.log("   Customer:", customerUser ? "✅ Ready" : "❌ Issue")
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testLogin()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
