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
