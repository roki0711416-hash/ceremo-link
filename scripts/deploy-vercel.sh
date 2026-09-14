#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! vercel whoami >/dev/null 2>&1; then
  echo "Vercel にログインしてください:"
  vercel login
fi

if [[ ! -f .env.local ]]; then
  echo ".env.local が見つかりません"
  exit 1
fi

# shellcheck disable=SC1091
source .env.local

if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" || -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
  echo "NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください"
  exit 1
fi

PROD_URL="${1:-https://ceremo-link.vercel.app}"
PROD_URL="${PROD_URL%/}"
echo "==> NEXT_PUBLIC_APP_URL=$PROD_URL"

add_env() {
  local name="$1"
  local value="$2"
  vercel env rm "$name" production --yes 2>/dev/null || true
  printf '%s' "$value" | vercel env add "$name" production
}

add_env NEXT_PUBLIC_SUPABASE_URL "$NEXT_PUBLIC_SUPABASE_URL"
add_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
add_env NEXT_PUBLIC_APP_URL "$PROD_URL"

if [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  add_env SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY"
fi

echo "==> Production deploy"
vercel deploy --prod --yes

echo ""
echo "デプロイ完了: $PROD_URL"
echo "Supabase → Authentication → URL Configuration に以下を追加:"
echo "  Site URL: $PROD_URL"
echo "  Redirect URLs: ${PROD_URL}/**"
