async function testLoginAPI() {
  const baseUrl = 'http://localhost:3001' // Note: using port 3001
  
  console.log("🧪 Testing Login API...")
  console.log("   Base URL:", baseUrl)
  
  // Test 1: Management account login
  console.log("\n1️⃣ Testing Management Login...")
  try {
    const managementResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shawn@management.com',
        password: 'account123'
      })
    })
    
    const managementData = await managementResponse.json()
    console.log("   Status:", managementResponse.status)
    console.log("   Response:", JSON.stringify(managementData, null, 2))
    
    if (managementData.ok) {
      console.log("   ✅ Management login successful!")
    } else {
      console.log("   ❌ Management login failed:", managementData.error)
    }
  } catch (error) {
    console.log("   ❌ Management login error:", error)
  }
  
  // Test 2: Admin account login
  console.log("\n2️⃣ Testing Admin Login...")
  try {
    const adminResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@coffeeshop.com',
        password: 'demo123'
      })
    })
    
    const adminData = await adminResponse.json()
    console.log("   Status:", adminResponse.status)
    console.log("   Response:", JSON.stringify(adminData, null, 2))
    
    if (adminData.ok) {
      console.log("   ✅ Admin login successful!")
    } else {
      console.log("   ❌ Admin login failed:", adminData.error)
    }
  } catch (error) {
    console.log("   ❌ Admin login error:", error)
  }
  
  // Test 3: Customer account login
  console.log("\n3️⃣ Testing Customer Login...")
  try {
    const customerResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'demo123'
      })
    })
    
    const customerData = await customerResponse.json()
    console.log("   Status:", customerResponse.status)
    console.log("   Response:", JSON.stringify(customerData, null, 2))
    
    if (customerData.ok) {
      console.log("   ✅ Customer login successful!")
    } else {
      console.log("   ❌ Customer login failed:", customerData.error)
    }
  } catch (error) {
    console.log("   ❌ Customer login error:", error)
  }
  
  // Test 4: Invalid credentials
  console.log("\n4️⃣ Testing Invalid Credentials...")
  try {
    const invalidResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    })
    
    const invalidData = await invalidResponse.json()
    console.log("   Status:", invalidResponse.status)
    console.log("   Response:", JSON.stringify(invalidData, null, 2))
    
    if (!invalidData.ok) {
      console.log("   ✅ Invalid credentials properly rejected!")
    } else {
      console.log("   ❌ Invalid credentials were accepted!")
    }
  } catch (error) {
    console.log("   ❌ Invalid credentials test error:", error)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testLoginAPI()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Test failed:", error)
      process.exit(1)
    })
}
