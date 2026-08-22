#!/usr/bin/env bash
# Demo deployment: rebuild the frontend against a given API URL and deploy to Cloudflare Workers.
# Usage: ./scripts/deploy_demo.sh <API_URL>   e.g.  ./scripts/deploy_demo.sh https://xxx.trycloudflare.com/api
set -euo pipefail

API_URL="${1:?Usage: ./scripts/deploy_demo.sh <API_URL e.g. https://xxx.trycloudflare.com/api>}"

echo "▶ Building frontend with VITE_API_URL=$API_URL"
VITE_API_URL="$API_URL" pnpm --filter=@repo/web build

echo "▶ Deploying to Cloudflare Workers"
npx wrangler deploy

echo "✅ Deployed. Open https://xiangqi-master.cuonglh2807.workers.dev"
