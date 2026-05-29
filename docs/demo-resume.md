# SDD+TDD デモ レジュメ（20分）

> **当日の前提:** Claude Code CLI を端末に投影。`master` ブランチはスケルトン（Task 1〜6 完了済み）に戻してデモを開始する。

---

## 事前チェック（デモ開始前）

```bash
# スケルトン状態に戻す（Task 6完了のコミットまで）
git checkout master
git reset --hard be8bdfd   # feat: implement employee service layer (GREEN)
npm install
npx prisma db push
npm test  # 6/6 PASS を確認
```

- [ ] ブラウザを閉じておく
- [ ] ターミナル文字サイズを大きく（聴衆が見やすいよう）
- [ ] `demo-answer` ブランチが GitHub にある（フォールバック用）

---

## 00:00〜01:00 ── オープニング（1分）

**言葉:**
> 「今日は SDD（仕様書駆動開発）と TDD（テスト駆動開発）を Claude Code で実践するデモです。仕様書からテストを先に書き、テストを通すために実装する――この流れを 20 分でやり切ります。」

**操作:**
```bash
cat docs/spec.md
```
→ 仕様書の内容（社員データ・API・機能要件）を画面に表示して口頭で説明

```bash
cat AGENT.md
```
→ Claude Code への制約（スタック・禁止事項）を画面に表示

---

## 01:00〜03:00 ── 現在地の確認（2分）

**言葉:**
> 「スケルトンはここまで用意しています。Prisma スキーマ、テスト環境、サービス層テスト（RED）、サービス層実装（GREEN）まで完了しています。」

**操作:**
```bash
git log --oneline
npm test
```

→ テスト 6/6 PASS を見せる。「仕様書から書いたテストがすでに通っています」

---

## 03:00〜07:00 ── API ルート生成（4分）

**言葉:**
> 「次は API ルートを作ります。Claude Code に指示を与えます。」

**Claude Code への指示例:**
```
/test-driven-development

仕様書 docs/spec.md と AGENT.md に従い、
app/api/employees/route.ts（GET一覧, POST登録）と
app/api/employees/[id]/route.ts（GET, PUT, DELETE）を実装してください。
サービス層は lib/employees.ts を使ってください。
```

**確認ポイント:**
- `lib/employees.ts` の関数を呼ぶだけの薄い Handler になっているか
- エラーハンドリングが Route Handler 層だけにあるか

---

## 07:00〜13:00 ── UI コンポーネント生成（6分）

**言葉:**
> 「API ができたので UI を作ります。shadcn/ui を使います。」

**Claude Code への指示例:**
```
以下の UI を実装してください。

1. components/employees/employee-table.tsx（一覧テーブル）
2. components/employees/employee-form.tsx（登録・編集フォーム）
3. components/employees/delete-button.tsx（削除確認ダイアログ）
4. app/employees/page.tsx（一覧ページ）
5. app/employees/new/page.tsx（登録ページ）
6. app/employees/[id]/edit/page.tsx（編集ページ）
7. app/page.tsx → /employees にリダイレクト
```

**確認ポイント:**
- `'use client'` が付いているか
- フォームが PUT/POST を使い分けているか
- 削除が AlertDialog で確認してから行うか

---

## 13:00〜17:00 ── 動作確認（4分）

**操作:**
```bash
npx prisma db push
npm run dev
```

ブラウザで `http://localhost:3000` を開く

**実演する操作:**
1. 社員一覧（空）を表示
2. 「+ 社員登録」→ 山田太郎（EMP001）を登録
3. 一覧に表示されることを確認
4. 編集ボタン → 部署を変更
5. 削除ボタン → ダイアログ確認 → 削除

---

## 17:00〜19:00 ── 全テストパス確認（2分）

**言葉:**
> 「仕様書から書いたテストは、実装後も全て通り続けています。これが TDD の価値です。」

**操作:**
```bash
npm test
```

→ `Tests 6 passed (6)` を見せる

---

## 19:00〜20:00 ── クロージング（1分）

**言葉:**
> 「まとめると、仕様書を書いて → テストを書いて（RED）→ 実装（GREEN）→ 全パスの流れです。
> Claude Code がコードを生成する間、私たちは仕様とテストの正しさに集中できます。
> これが AI 駆動の SDD+TDD です。」

---

## フォールバック手順

デモ中に詰まったとき:

```bash
# 完成版に切り替え
git stash
git checkout demo-answer
npm run dev
```

---

## コマンドチートシート

| 操作 | コマンド |
|------|---------|
| テスト実行 | `npm test` |
| 開発サーバー起動 | `npm run dev` |
| スケルトンに戻す | `git reset --hard be8bdfd` |
| 完成版に切替 | `git checkout demo-answer` |
| 仕様書表示 | `cat docs/spec.md` |
| 制約表示 | `cat AGENT.md` |
