# セレモリンク（CeremoLink）

神奈川県内の葬儀社と、葬儀業務経験のあるフリーランスをマッチングするスマートフォン優先 Web アプリです。

- 日本語表示名: セレモリンク
- 英語表記: CeremoLink
- プロジェクト名: `ceremo-link`
- タイムゾーン表示: `Asia/Tokyo`
- 通貨: 日本円（整数）

## 技術スタック

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth / PostgreSQL / Storage
- Zod + React Hook Form
- Vitest + Playwright

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

```bash
cp .env.example .env.local
```

`.env.local` に Supabase の値を設定します。

| 変数 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | プロジェクト URL（公開可） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key（公開可・RLS前提） |
| `SUPABASE_SERVICE_ROLE_KEY` | service role（**サーバーのみ。ブラウザに出さない**） |
| `NEXT_PUBLIC_APP_URL` | アプリのベース URL（開発は `http://localhost:3001`。末尾スラッシュなし） |

### 3. データベース

Supabase CLI 例:

```bash
npx supabase db push
```

- マイグレーション: `supabase/migrations/`
- シード: `supabase/seed.sql`（実在人物の個人情報は含みません）
- `db reset` はデータを消す可能性があるため、開発用でも必要なとき以外は使いません

型生成（`supabase link` 済みの開発プロジェクトから。Docker 不要）:

```bash
npm run db:types
```

手書きの `src/types/database.ts` は初期実装用です。生成結果（`src/types/database.generated.ts`）で置き換えてください。

### 4. 起動

```bash
npm run dev
```

開発サーバーは **http://localhost:3001** で起動します（`NEXT_PUBLIC_APP_URL` と揃えてください）。

#### Supabase ダッシュボード（メール認証の戻り先）

認証メールが別ポートへ飛ぶ場合は、プロジェクトの **Authentication → URL Configuration** を確認します。

- **Site URL**: `http://localhost:3001`
- **Redirect URLs** に以下を追加:
  - `http://localhost:3001/auth/callback`
  - `http://127.0.0.1:3001/auth/callback`

アプリ側の signup / パスワードリセットは `NEXT_PUBLIC_APP_URL` から `emailRedirectTo` / `redirectTo` を組み立てます。本番ホスト名はコードに固定しません。

## スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript チェック |
| `npm test` | Vitest（単体） |
| `npm run test:e2e` | Playwright |
| `npm run db:types` | 接続済み開発プロジェクトから型生成（`--linked`） |

## 画面デザイン（ダミーUI）

ログイン後、各ロールのホームからデモ導線を開けます。

### 葬儀社
- `/funeral-company/facilities` 火葬場カード一覧
- `/funeral-company/facilities/[id]/staff` スタッフ対応状況（◎○△×）
- `/funeral-company/requests/new/*` 日時→詳細→確認→マッチング待ち
- `/funeral-company/demo/jobs/job-assigned-1` 成立〜当日〜完了

### フリーランス
- `/freelancer/availability` 空き日カレンダー
- `/freelancer/availability/times` 時間帯入力（重複不可）
- `/freelancer/demo/offers` 依頼一覧・受諾
- `/freelancer/demo/jobs/job-assigned-1` 成立〜前日確認〜当日〜報酬

ダミーデータに実在人物・実在故人は含みません。DBマイグレーションは追加していません。

- トップ / ログイン / 区分別新規登録
- Supabase 認証とロール別ダッシュボード枠
- DB スキーマ・RLS・制約・`publish_job_request` / `claim_open_job`
- 葬儀社の依頼公開（一斉通知）とフリーランスの先着承諾 UI
- 連絡・重要変更・当日操作は画面枠のみ

未実装または枠のみ: プロフィール詳細、審査 UI、空き枠 UI、メッセージ送受信、重要変更の確認/再承諾 UI

### マイグレーション適用（開発プロジェクト・データ削除なし）

```bash
npx supabase db push
```

`db reset` は使いません。適用後:

```bash
npm run db:types
```

## セキュリティ上の注意

- ブラウザから渡された `role` は信用しません（DB の `profiles.role` を参照）
- `role` / 審査状態は本人が変更できないようトリガーで保護しています
- 本人確認書類は非公開バケット `identity-docs`（固定公開 URL なし）
- `service_role` キーはコミットしないでください
