import { execSync } from 'child_process'
import { prisma } from '../lib/prisma'

beforeAll(() => {
  execSync('npx prisma db push --skip-generate --force-reset', {
    stdio: 'inherit',
    env: process.env
  })
})

afterEach(async () => {
  await prisma.employee.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
