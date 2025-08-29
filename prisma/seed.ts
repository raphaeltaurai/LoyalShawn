import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'coffee-shop-1' },
    update: {},
    create: {
      slug: 'coffee-shop-1',
      name: 'Coffee Shop'
    }
  })

  // Create sample admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@coffeeshop.com' },
    update: {},
    create: {
      email: 'admin@coffeeshop.com',
      name: 'Coffee Shop Admin',
      role: 'admin',
      passwordHash: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // demo123
      tenantId: tenant.id
    }
  })

  // Create sample customer user
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'John Customer',
      role: 'customer',
      passwordHash: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1m', // demo123
      tenantId: tenant.id
    }
  })

  // Create loyalty program
  const program = await prisma.program.upsert({
    where: { id: 'default-program' },
    update: {},
    create: {
      id: 'default-program',
      tenantId: tenant.id,
      name: 'Coffee Lovers Rewards',
      pointsPerDollar: 2,
      birthdayBonus: 250,
      checkInBonusPoints: 50,
      checkInRadiusMeters: 150
    }
  })

  // Create sample rewards
  const rewards = await Promise.all([
    prisma.reward.upsert({
      where: { id: 'reward-1' },
      update: {},
      create: {
        id: 'reward-1',
        tenantId: tenant.id,
        name: 'Free Coffee',
        description: 'Any size coffee drink',
        pointsCost: 500,
        category: 'Beverages',
        isActive: true,
        usageCount: 0
      }
    }),
    prisma.reward.upsert({
      where: { id: 'reward-2' },
      update: {},
      create: {
        id: 'reward-2',
        tenantId: tenant.id,
        name: 'Free Pastry',
        description: 'Any pastry or dessert',
        pointsCost: 300,
        category: 'Food',
        isActive: true,
        usageCount: 0
      }
    }),
    prisma.reward.upsert({
      where: { id: 'reward-3' },
      update: {},
      create: {
        id: 'reward-3',
        tenantId: tenant.id,
        name: '10% Off Next Visit',
        description: 'Valid for 30 days',
        pointsCost: 200,
        category: 'Discounts',
        isActive: true,
        usageCount: 0
      }
    })
  ])

  // Create sample geofences
  const geofences = await Promise.all([
    prisma.geofence.upsert({
      where: { id: 'geofence-1' },
      update: {},
      create: {
        id: 'geofence-1',
        tenantId: tenant.id,
        name: 'Main Street Location',
        latitude: 40.7128,
        longitude: -74.0060,
        radiusMeters: 150
      }
    }),
    prisma.geofence.upsert({
      where: { id: 'geofence-2' },
      update: {},
      create: {
        id: 'geofence-2',
        tenantId: tenant.id,
        name: 'Downtown Location',
        latitude: 40.7589,
        longitude: -73.9851,
        radiusMeters: 150
      }
    })
  ])

  // Create sample transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        userId: customerUser.id,
        tenantId: tenant.id,
        amount: 12.50,
        pointsEarned: 25,
        pointsRedeemed: 0,
        location: 'Main Street Location',
        paymentMethod: 'Credit Card'
      }
    }),
    prisma.transaction.create({
      data: {
        userId: customerUser.id,
        tenantId: tenant.id,
        amount: 8.75,
        pointsEarned: 17,
        pointsRedeemed: 0,
        location: 'Downtown Location',
        paymentMethod: 'Cash'
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log('📧 Demo accounts:')
  console.log('   Admin: admin@coffeeshop.com / demo123')
  console.log('   Customer: customer@example.com / demo123')
  console.log('   Management: shawn@management.com / account123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


