# 人事管理アプリ SDD+TDDデモ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SDD+TDDを実践するデモとして、仕様書先行→テスト先行→実装→全パスの流れを20分で完走できる人事管理アプリを構築する。

**Architecture:** 仕様書(spec.md)とAGENT.mdを起点に、Vitest+Prismaによるサービス層のAPIインテグレーションテストを先に作成（Red）、その後実装（Green）の順で進める。UIはNext.js App Router + shadcn/uiで構築し、データアクセスは lib/employees.ts のサービス層に集約する。

**Tech Stack:** Next.js 15 (App Router), Prisma, SQLite, Tailwind CSS, shadcn/ui, Vitest

---

## ファイル構成

```
example_65_2/
├── CLAUDE.md
├── AGENT.md                          ← Task 2で作成
├── docs/
│   └── spec.md                       ← Task 1で作成
├── app/
│   ├── api/
│   │   └── employees/
│   │       ├── route.ts              ← Task 7: GET(一覧), POST(登録)
│   │       └── [id]/
│   │           └── route.ts          ← Task 7: GET(1件), PUT(更新), DELETE(削除)
│   ├── employees/
│   │   ├── page.tsx                  ← Task 8: 社員一覧ページ
│   │   ├── new/
│   │   │   └── page.tsx              ← Task 8: 社員登録ページ
│   │   └── [id]/edit/
│   │       └── page.tsx              ← Task 8: 社員編集ページ
│   ├── layout.tsx
│   └── page.tsx                      ← /employeesへリダイレクト
├── components/
│   └── employees/
│       ├── employee-table.tsx        ← Task 8: 一覧テーブル
│       ├── employee-form.tsx         ← Task 8: 登録・編集フォーム
│       └── delete-button.tsx         ← Task 8: 削除確認ダイアログ
├── lib/
│   ├── prisma.ts                     ← Task 4: Prismaシングルトン
│   └── employees.ts                  ← Task 6: サービス層
├── prisma/
│   ├── schema.prisma                 ← Task 3: Employeeモデル定義
│   └── dev.db                        ← マイグレーション後に生成
├── tests/
│   ├── setup.ts                      ← Task 4: テストDB初期化
│   └── employees.test.ts             ← Task 5: サービス層テスト（RED→GREEN）
├── vitest.config.ts                  ← Task 4: テスト設定
├── .env                              ← DATABASE_URL設定
└── package.json
```

---

## 【事前準備】デモ前スケルトン作成（デモ当日は不要）

```bash
# example_65_2 ディレクトリで実行
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"

# 追加依存インストール
npm install prisma @prisma/client
npm install -D vitest @vitejs/plugin-react

# Prisma初期化
npx prisma init --datasource-provider sqlite

# shadcn/ui初期化
npx shadcn@latest init --defaults

# shadcnコンポーネント追加
npx shadcn@latest add button input label table dialog alert-dialog form

# フォールバック用ブランチ保存
git init
git add .
git commit -m "chore: skeleton setup"
git checkout -b demo-answer
```

---

## Task 1: 仕様書 (docs/spec.md) 作成

**Files:**
- Create: `docs/spec.md`

- [ ] **Step 1: 仕様書ファイルを作成する**

```markdown
# 人事管理アプリケーション 仕様書

## 概要
社員データの登録・更新・削除・一覧表示を行えるWebアプリケーション。

## 社員データモデル

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| id | 整数 | ○ | 主キー（自動採番） |
| employeeId | 文字列 | ○ | 社員番号（一意） |
| name | 文字列 | ○ | 氏名 |
| department | 文字列 | ○ | 部署名 |
| position | 文字列 | ○ | 役職 |
| hireDate | 日付 | ○ | 入社日 |
| mailAddress | 文字列 | ○ | メールアドレス（一意） |

## 機能要件

### 1. 社員一覧表示
- 全社員を社員番号順で表形式表示
- 各行に編集・削除ボタンを表示

### 2. 社員登録
- 全フィールドの入力フォーム
- バリデーション：必須チェック、社員番号・メール重複チェック
- 登録成功後は一覧画面へ遷移

### 3. 社員更新
- 既存データを初期値としてフォーム表示
- 更新成功後は一覧画面へ遷移

### 4. 社員削除
- 確認ダイアログを表示してから削除
- 削除成功後は一覧画面へ遷移

## APIエンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| GET | /api/employees | 社員一覧取得 |
| POST | /api/employees | 社員登録 |
| GET | /api/employees/:id | 社員1件取得 |
| PUT | /api/employees/:id | 社員更新 |
| DELETE | /api/employees/:id | 社員削除 |

## スコープ外
- 認証・認可
- 本番環境へのデプロイ
- UIテスト（E2E）
- 外部API連携
```

- [ ] **Step 2: コミット**

```bash
git add docs/spec.md
git commit -m "docs: add specification"
```

---

## Task 2: AGENT.md 作成

**Files:**
- Create: `AGENT.md`

- [ ] **Step 1: AGENT.mdファイルを作成する**

```markdown
# AGENT.md - Claude Code 実装制約・コーディング規約

## 技術スタック
- Next.js 15 (App Router)
- Prisma + SQLite
- Tailwind CSS + shadcn/ui
- Vitest (APIインテグレーションテスト)

## 実装ルール

### Next.js
- APIはすべて `app/api/` 配下の Route Handlers で実装すること
- Server Actions は使用禁止
- Prismaの呼び出しは `lib/employees.ts` のサービス関数経由のみ
- UIページコンポーネントは `'use client'` ディレクティブを付与すること

### Prisma
- Prisma Clientは `lib/prisma.ts` のシングルトン経由のみ使用
- 各ファイルで `new PrismaClient()` を直接作成しないこと

### テスト
- テスト対象は `lib/employees.ts` のサービス層関数のみ
- APIルートのテスト・UIテストはスコープ外
- テストDB: `prisma/test.db`（本番DBと分離）

### コード規約
- TypeScript strict mode
- エラーハンドリングは API Route Handler 層のみ
- サービス層は例外をスローする（呼び出し元でキャッチ）

## スコープ外
- 認証・認可
- Server Actions
- UIテスト（Playwright等）
- 外部API連携
```

- [ ] **Step 2: コミット**

```bash
git add AGENT.md
git commit -m "docs: add AGENT.md with implementation constraints"
```

---

## Task 3: Prismaスキーマ定義

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `.env`

- [ ] **Step 1: .envにDATABASE_URLを設定する**

```
DATABASE_URL="file:./prisma/dev.db"
```

- [ ] **Step 2: prisma/schema.prismaにEmployeeモデルを定義する**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Employee {
  id          Int      @id @default(autoincrement())
  employeeId  String   @unique
  name        String
  department  String
  position    String
  hireDate    DateTime
  mailAddress String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

- [ ] **Step 3: マイグレーション実行**

```bash
npx prisma migrate dev --name init
```

期待出力:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

- [ ] **Step 4: コミット**

```bash
git add prisma/ .env
git commit -m "feat: define Employee schema and run initial migration"
```

---

## Task 4: テスト環境設定

**Files:**
- Create: `lib/prisma.ts`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: lib/prisma.ts を作成する（Prismaシングルトン）**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: vitest.config.ts を作成する**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    env: {
      DATABASE_URL: 'file:./prisma/test.db'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
})
```

- [ ] **Step 3: tests/setup.ts を作成する**

```typescript
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
```

- [ ] **Step 4: package.jsonにtestスクリプトを追加する**

`package.json` の `scripts` に追記：
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: コミット**

```bash
git add lib/prisma.ts vitest.config.ts tests/setup.ts package.json
git commit -m "feat: setup Vitest + Prisma test environment"
```

---

## Task 5: サービス層テスト作成（RED）

**Files:**
- Create: `tests/employees.test.ts`

- [ ] **Step 1: tests/employees.test.ts を作成する（テストファースト）**

```typescript
import { describe, it, expect } from 'vitest'
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../lib/employees'

const sampleEmployee = {
  employeeId: 'EMP001',
  name: '山田太郎',
  department: '開発部',
  position: 'エンジニア',
  hireDate: '2024-04-01',
  mailAddress: 'yamada@example.com',
}

describe('createEmployee', () => {
  it('社員を登録できる', async () => {
    const employee = await createEmployee(sampleEmployee)
    expect(employee.employeeId).toBe('EMP001')
    expect(employee.name).toBe('山田太郎')
    expect(employee.mailAddress).toBe('yamada@example.com')
  })
})

describe('getEmployees', () => {
  it('社員一覧を社員番号順で取得できる', async () => {
    await createEmployee(sampleEmployee)
    await createEmployee({
      employeeId: 'EMP002',
      name: '田中花子',
      department: '営業部',
      position: 'マネージャー',
      hireDate: '2023-04-01',
      mailAddress: 'tanaka@example.com',
    })
    const employees = await getEmployees()
    expect(employees).toHaveLength(2)
    expect(employees[0].employeeId).toBe('EMP001')
  })
})

describe('getEmployee', () => {
  it('IDで社員を1件取得できる', async () => {
    const created = await createEmployee(sampleEmployee)
    const employee = await getEmployee(created.id)
    expect(employee?.name).toBe('山田太郎')
  })

  it('存在しないIDはnullを返す', async () => {
    const employee = await getEmployee(999)
    expect(employee).toBeNull()
  })
})

describe('updateEmployee', () => {
  it('社員情報を更新できる', async () => {
    const created = await createEmployee(sampleEmployee)
    const updated = await updateEmployee(created.id, { department: '営業部' })
    expect(updated.department).toBe('営業部')
  })
})

describe('deleteEmployee', () => {
  it('社員を削除できると一覧から消える', async () => {
    const created = await createEmployee(sampleEmployee)
    await deleteEmployee(created.id)
    const employee = await getEmployee(created.id)
    expect(employee).toBeNull()
  })
})
```

- [ ] **Step 2: テストを実行してREDを確認する**

```bash
npm test
```

期待出力:
```
FAIL tests/employees.test.ts
  × Cannot find module '../lib/employees'
```

**← ここがTDDのRedステート。実装前にテストが失敗することを聴衆に見せる。**

- [ ] **Step 3: コミット**

```bash
git add tests/employees.test.ts
git commit -m "test: add employee service tests (RED)"
```

---

## Task 6: サービス層実装（GREEN）

**Files:**
- Create: `lib/employees.ts`

- [ ] **Step 1: lib/employees.ts を作成する**

```typescript
import { prisma } from './prisma'

export type EmployeeInput = {
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export async function getEmployees() {
  return prisma.employee.findMany({
    orderBy: { employeeId: 'asc' }
  })
}

export async function getEmployee(id: number) {
  return prisma.employee.findUnique({ where: { id } })
}

export async function createEmployee(data: EmployeeInput) {
  return prisma.employee.create({
    data: {
      ...data,
      hireDate: new Date(data.hireDate)
    }
  })
}

export async function updateEmployee(id: number, data: Partial<EmployeeInput>) {
  return prisma.employee.update({
    where: { id },
    data: {
      ...data,
      ...(data.hireDate ? { hireDate: new Date(data.hireDate) } : {})
    }
  })
}

export async function deleteEmployee(id: number) {
  return prisma.employee.delete({ where: { id } })
}
```

- [ ] **Step 2: テストを実行してGREENを確認する**

```bash
npm test
```

期待出力:
```
✓ tests/employees.test.ts (5)
  ✓ createEmployee > 社員を登録できる
  ✓ getEmployees > 社員一覧を社員番号順で取得できる
  ✓ getEmployee > IDで社員を1件取得できる
  ✓ getEmployee > 存在しないIDはnullを返す
  ✓ updateEmployee > 社員情報を更新できる
  ✓ deleteEmployee > 社員を削除できると一覧から消える

Test Files  1 passed (1)
Tests       6 passed (6)
```

**← ここがGreenステート。聴衆に「仕様書から書いたテストが通った」ことを示す。**

- [ ] **Step 3: コミット**

```bash
git add lib/employees.ts
git commit -m "feat: implement employee service layer (GREEN)"
```

---

## Task 7: APIルート実装

**Files:**
- Create: `app/api/employees/route.ts`
- Create: `app/api/employees/[id]/route.ts`

- [ ] **Step 1: app/api/employees/route.ts を作成する（GET一覧, POST登録）**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getEmployees, createEmployee } from '@/lib/employees'

export async function GET() {
  try {
    const employees = await getEmployees()
    return NextResponse.json(employees)
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employee = await createEmployee(body)
    return NextResponse.json(employee, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
```

- [ ] **Step 2: app/api/employees/[id]/route.ts を作成する（GET, PUT, DELETE）**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getEmployee, updateEmployee, deleteEmployee } from '@/lib/employees'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const employee = await getEmployee(Number(id))
    if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const employee = await updateEmployee(Number(id), body)
    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteEmployee(Number(id))
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: コミット**

```bash
git add app/api/
git commit -m "feat: implement employee CRUD API routes"
```

---

## Task 8: UIコンポーネント実装

**Files:**
- Create: `components/employees/employee-table.tsx`
- Create: `components/employees/employee-form.tsx`
- Create: `components/employees/delete-button.tsx`
- Create: `app/employees/page.tsx`
- Create: `app/employees/new/page.tsx`
- Create: `app/employees/[id]/edit/page.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: components/employees/delete-button.tsx を作成する**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function DeleteButton({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">削除</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>社員を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            削除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

- [ ] **Step 2: components/employees/employee-form.tsx を作成する**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Employee = {
  id?: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Employee>({
    employeeId: employee?.employeeId ?? '',
    name: employee?.name ?? '',
    department: employee?.department ?? '',
    position: employee?.position ?? '',
    hireDate: employee?.hireDate
      ? new Date(employee.hireDate).toISOString().split('T')[0]
      : '',
    mailAddress: employee?.mailAddress ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const url = employee?.id ? `/api/employees/${employee.id}` : '/api/employees'
    const method = employee?.id ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    router.push('/employees')
    router.refresh()
  }

  const fields: { key: keyof Employee; label: string; type?: string }[] = [
    { key: 'employeeId', label: '社員番号' },
    { key: 'name', label: '氏名' },
    { key: 'department', label: '部署' },
    { key: 'position', label: '役職' },
    { key: 'hireDate', label: '入社日', type: 'date' },
    { key: 'mailAddress', label: 'メールアドレス', type: 'email' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {fields.map(({ key, label, type = 'text' }) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type={type}
            required
            value={form[key] as string}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {employee?.id ? '更新する' : '登録する'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: components/employees/employee-table.tsx を作成する**

```typescript
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteButton } from './delete-button'

type Employee = {
  id: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string | Date
  mailAddress: string
}

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>社員番号</TableHead>
          <TableHead>氏名</TableHead>
          <TableHead>部署</TableHead>
          <TableHead>役職</TableHead>
          <TableHead>入社日</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell>{emp.employeeId}</TableCell>
            <TableCell>{emp.name}</TableCell>
            <TableCell>{emp.department}</TableCell>
            <TableCell>{emp.position}</TableCell>
            <TableCell>
              {new Date(emp.hireDate).toLocaleDateString('ja-JP')}
            </TableCell>
            <TableCell>{emp.mailAddress}</TableCell>
            <TableCell className="flex gap-2">
              <Link href={`/employees/${emp.id}/edit`}>
                <Button variant="outline" size="sm">編集</Button>
              </Link>
              <DeleteButton id={emp.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 4: app/employees/page.tsx を作成する（一覧ページ）**

```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmployeeTable } from '@/components/employees/employee-table'

type Employee = {
  id: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then(setEmployees)
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">社員一覧</h1>
        <Link href="/employees/new">
          <Button>+ 社員登録</Button>
        </Link>
      </div>
      <EmployeeTable employees={employees} />
    </div>
  )
}
```

- [ ] **Step 5: app/employees/new/page.tsx を作成する（登録ページ）**

```typescript
'use client'

import { EmployeeForm } from '@/components/employees/employee-form'

export default function NewEmployeePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">社員登録</h1>
      <EmployeeForm />
    </div>
  )
}
```

- [ ] **Step 6: app/employees/[id]/edit/page.tsx を作成する（編集ページ）**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { EmployeeForm } from '@/components/employees/employee-form'

type Employee = {
  id: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>()
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then(setEmployee)
  }, [id])

  if (!employee) return <div className="container mx-auto py-8">読み込み中...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">社員編集</h1>
      <EmployeeForm employee={employee} />
    </div>
  )
}
```

- [ ] **Step 7: app/page.tsx を /employees へリダイレクトする**

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/employees')
}
```

- [ ] **Step 8: コミット**

```bash
git add components/ app/
git commit -m "feat: implement employee UI (list, create, edit, delete)"
```

---

## Task 9: 全テストパス確認

- [ ] **Step 1: 全テストを実行する**

```bash
npm test
```

期待出力:
```
✓ tests/employees.test.ts (6)
  ✓ createEmployee > 社員を登録できる
  ✓ getEmployees > 社員一覧を社員番号順で取得できる
  ✓ getEmployee > IDで社員を1件取得できる
  ✓ getEmployee > 存在しないIDはnullを返す
  ✓ updateEmployee > 社員情報を更新できる
  ✓ deleteEmployee > 社員を削除できると一覧から消える

Test Files  1 passed (1)
Tests       6 passed (6)
Duration    X.XXs
```

- [ ] **Step 2: 開発サーバーで動作確認する**

```bash
npx prisma db push
npm run dev
```

ブラウザで `http://localhost:3000` を開き、以下を確認：
- 社員一覧表示（空）
- 社員登録 → 一覧に表示
- 社員編集 → 更新反映
- 社員削除 → 一覧から消える

- [ ] **Step 3: 最終コミット**

```bash
git add -A
git commit -m "feat: complete HR management demo app"
```

- [ ] **Step 4: フォールバック用正解ブランチを保存する**

```bash
git checkout -b demo-answer
git checkout main
```

---

## デモ当日タイムライン（20分）

| 時間 | 内容 | コマンド |
|---|---|---|
| 0:00-1:00 | 仕様書・AGENT.mdを画面表示 | `cat docs/spec.md` / `cat AGENT.md` |
| 1:00-3:00 | `/writing-plans` でAGENT.mdと計画生成 | Claude Code起動 |
| 3:00-7:00 | `/test-driven-development` でテスト生成（RED確認） | `npm test` → FAIL |
| 7:00-13:00 | TDDスキル継続 → 実装コード生成 | 実装ファイル生成 |
| 13:00-17:00 | UIコンポーネント生成 | shadcn/ui活用 |
| 17:00-19:00 | `/verification-before-completion` で全テストパス確認 | `npm test` → ALL PASS |
| 19:00-20:00 | ブラウザで動作確認 | `npm run dev` |
