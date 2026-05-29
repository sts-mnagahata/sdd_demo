import { execSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import { prisma } from '../lib/prisma'

beforeAll(() => {
  const testDb = 'prisma/test.db'
  if (existsSync(testDb)) unlinkSync(testDb)
  execSync('npx prisma db push --skip-generate', {
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
