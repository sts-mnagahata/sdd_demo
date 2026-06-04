<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md - Claude Code 実装制約・コーディング規約

## 技術スタック
- Next.js 16 (App Router / Turbopack)
- Prisma 6.x + SQLite
- Tailwind CSS
- Vitest **^3.x**（4.x は ESM/CJS 互換性問題あり）

## 実装ルール

### Next.js
- APIはすべて `app/api/` 配下の Route Handlers で実装すること
- Server Actions は使用禁止
- Prismaの呼び出しは `lib/employees.ts` のサービス関数経由のみ
- UIページコンポーネントは `'use client'` ディレクティブを付与すること

### Prisma
- Prisma Clientは `lib/prisma.ts` のシングルトン経由のみ使用
- 各ファイルで `new PrismaClient()` を直接作成しないこと
- `prisma/schema.prisma` の generator は **`provider = "prisma-client-js"`** を使用すること
  - `provider = "prisma-client"`（TypeScript 新ジェネレーター）は Turbopack とパス解決が非互換
  - カスタム `output` は指定しない（`node_modules/@prisma/client` に生成する）
- `lib/prisma.ts` の import は **`from '@prisma/client'`** とすること
- `next.config.ts` に **`serverExternalPackages: ['@prisma/client']`** を必ず設定すること
  - これがないと Turbopack が Prisma クライアントをバンドルし SQLite DB が見つからなくなる

### テスト
- テスト対象は `lib/employees.ts` のサービス層関数のみ
- APIルートのテスト・UIテストはスコープ外
- テストDB: `prisma/test.db`（本番DBと分離）
- `tests/setup.ts` の `prisma db push` に **`--force-reset` を使用しないこと**
  - Claude Code（AI）から実行すると Prisma の安全チェックでブロックされテストが全スキップになる
  - 代わりに `beforeAll` 内で `prisma.employee.deleteMany()` でクリーンアップする

### コード規約
- TypeScript strict mode
- エラーハンドリングは API Route Handler 層のみ
- サービス層は例外をスローする（呼び出し元でキャッチ）

## スコープ外
- 認証・認可
- Server Actions
- UIテスト（Playwright等）
- 外部API連携

## AI作業スタイル
- ビジュアルコンパニオン（ブラウザでのモックアップ表示）の提案は不要
- UI実装時は brainstorming の clarifying questions を省略し、仕様書に従い直接実装すること
