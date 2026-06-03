import { execSync } from 'child_process'
import { prisma } from '../lib/prisma'

beforeAll(async () => {
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: process.env
  })
  await prisma.employee.deleteMany()
})

afterEach(async () => {
  await prisma.employee.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
