import bcrypt from 'bcryptjs'
import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main(){
  const password = 'demo123'
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.update({
    where: { email: 'customer@example.com' },
    data: { passwordHash: hash }
  })
  console.log('Updated user:', user.email)
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect())
