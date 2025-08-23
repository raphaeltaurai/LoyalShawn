import { PrismaClient } from "../lib/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "coffee-shop-1" },
    update: {},
    create: { slug: "coffee-shop-1", name: "Coffee Shop Zimbabwe" },
  })

  const adminPass = await bcrypt.hash("demo123", 10)
  await prisma.user.upsert({
    where: { email: "admin@coffeeshop.com" },
    update: {},
    create: { email: "admin@coffeeshop.com", name: "Zim Admin", role: "admin", passwordHash: adminPass, tenantId: tenant.id },
  })
  const custPass = await bcrypt.hash("demo123", 10)
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: { email: "customer@example.com", name: "Zim Customer", role: "customer", passwordHash: custPass, tenantId: tenant.id },
  })

  await prisma.program.upsert({
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

  await prisma.reward.createMany({
    data: [
      { tenantId: tenant.id, name: "Free Coffee", description: "Any size coffee", pointsCost: 500, category: "Beverages" },
      { tenantId: tenant.id, name: "10% Off", description: "Valid 30 days", pointsCost: 200, category: "Discounts" },
    ],
  })

  // Seed a couple transactions
  await prisma.transaction.create({
    data: {
      userId: customer.id,
      tenantId: tenant.id,
      amount: 12.5,
      pointsEarned: 25,
      location: "Harare CBD",
      paymentMethod: "Credit Card",
    },
  })
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


