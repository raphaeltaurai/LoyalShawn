import { PrismaClient } from "../lib/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")
  
  const tenant = await prisma.tenant.upsert({
    where: { slug: "coffee-shop-1" },
    update: {},
    create: { slug: "coffee-shop-1", name: "Coffee Shop Zimbabwe" },
  })
  console.log("✅ Tenant created:", tenant.name)

  const adminPass = await bcrypt.hash("demo123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@coffeeshop.com" },
    update: {},
    create: { email: "admin@coffeeshop.com", name: "Zim Admin", role: "admin", passwordHash: adminPass, tenantId: tenant.id },
  })
  console.log("✅ Admin user created:", admin.email)
  
  const custPass = await bcrypt.hash("demo123", 10)
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: { email: "customer@example.com", name: "Zim Customer", role: "customer", passwordHash: custPass, tenantId: tenant.id },
  })
  console.log("✅ Customer user created:", customer.email)

  // Create 10 sample customers
  const sampleCustomers = [
    { name: "Sarah Johnson", email: "sarah.j@example.com" },
    { name: "Michael Chen", email: "michael.c@example.com" },
    { name: "Emma Davis", email: "emma.d@example.com" },
    { name: "James Wilson", email: "james.w@example.com" },
    { name: "Lisa Brown", email: "lisa.b@example.com" },
    { name: "David Miller", email: "david.m@example.com" },
    { name: "Anna Garcia", email: "anna.g@example.com" },
    { name: "Robert Taylor", email: "robert.t@example.com" },
    { name: "Maria Rodriguez", email: "maria.r@example.com" },
    { name: "Thomas Anderson", email: "thomas.a@example.com" },
  ]

  for (const customerData of sampleCustomers) {
    const customerPass = await bcrypt.hash("demo123", 10)
    await prisma.user.upsert({
      where: { email: customerData.email },
      update: {},
      create: { 
        email: customerData.email, 
        name: customerData.name, 
        role: "customer", 
        passwordHash: customerPass, 
        tenantId: tenant.id 
      },
    })
  }
  console.log("✅ Sample customers created:", sampleCustomers.length, "customers")

  const program = await prisma.program.upsert({
    where: { id: "default-program" },
    update: {},
    create: {
      id: "default-program",
      tenantId: tenant.id,
      name: "Coffee Lovers ZW",
      pointsPerDollar: 2,
      birthdayBonus: 250,
      checkInBonusPoints: 50,
      checkInRadiusMeters: 150,
    },
  })
  console.log("✅ Program created:", program.name)

  // Zimbabwe locations (Harare, Bulawayo, Victoria Falls, Mutare)
  const geofences = [
    { name: "Harare CBD", latitude: -17.8312, longitude: 31.0522, radiusMeters: 300 },
    { name: "Bulawayo Center", latitude: -20.1575, longitude: 28.5880, radiusMeters: 300 },
    { name: "Victoria Falls Town", latitude: -17.9243, longitude: 25.8560, radiusMeters: 400 },
    { name: "Mutare Central", latitude: -18.9758, longitude: 32.6699, radiusMeters: 300 },
  ]
  for (const f of geofences) {
    await prisma.geofence.create({ data: { tenantId: tenant.id, ...f } })
  }
  console.log("✅ Geofences created:", geofences.length, "locations")

  const rewards = await prisma.reward.createMany({
    data: [
      { tenantId: tenant.id, name: "Free Coffee", description: "Any size coffee", pointsCost: 500, category: "Beverages" },
      { tenantId: tenant.id, name: "10% Off", description: "Valid 30 days", pointsCost: 200, category: "Discounts" },
    ],
  })
  console.log("✅ Rewards created:", rewards.count, "rewards")

  // Seed a couple transactions
  const transaction = await prisma.transaction.create({
    data: {
      userId: customer.id,
      tenantId: tenant.id,
      amount: 12.5,
      pointsEarned: 25,
      location: "Harare CBD",
      paymentMethod: "Credit Card",
    },
  })
  console.log("✅ Transaction created: $", transaction.amount, "at", transaction.location)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


