const { PrismaClient } = require('./lib/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createManagementUser() {
  try {
    console.log('🔧 Creating management user...')
    
    // Create management tenant
    const managementTenant = await prisma.tenant.upsert({
      where: { slug: 'management' },
      update: {},
      create: {
        slug: 'management',
        name: 'Management System'
      }
    })
    console.log('✅ Management tenant created/found')
    
    // Generate password hash
    const passwordHash = await bcrypt.hash('account123', 10)
    
    // Create management user
    const managementUser = await prisma.user.upsert({
      where: { email: 'shawn@management.com' },
      update: {
        passwordHash: passwordHash
      },
      create: {
        email: 'shawn@management.com',
        name: 'Shawn Management',
        role: 'management',
        passwordHash: passwordHash,
        tenantId: managementTenant.id
      }
    })
    
    console.log('✅ Management user created/updated')
    console.log('📧 Management account:')
    console.log('   Email: shawn@management.com')
    console.log('   Password: account123')
    console.log('   Role: management')
    
  } catch (error) {
    console.error('❌ Error creating management user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createManagementUser()

