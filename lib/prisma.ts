import { PrismaClient } from '../app/generated/prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// SQLite の相対パスを絶対パスに変換（Prisma 6 + Windows で相対パスが解決できない問題の回避）
const url = process.env.DATABASE_URL ?? ''
if (url.startsWith('file:./') || url.startsWith('file:../')) {
  const relativePath = url.slice('file:'.length)
  process.env.DATABASE_URL = `file:${path.resolve(relativePath)}`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
