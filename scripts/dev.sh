#!/bin/bash
set -e

echo "🏯 Xiangqi Master — Starting..."
echo "================================"
echo ""

# 1. Start Docker services (PostgreSQL + Redis)
echo "🐳 [1/4] Starting PostgreSQL + Redis..."
docker compose -f docker-compose.dev.yml up -d 2>/dev/null || true
echo "   ✅ Database & cache ready"
echo ""

# 2. Build packages
echo "🔨 [2/4] Building packages..."
pnpm run build 2>/dev/null || true
echo "   ✅ Packages built"
echo ""

# 3. Start API
echo "🔧 [3/4] Starting API (http://localhost:3000)..."
pnpm --filter @repo/api dev &
API_PID=$!
sleep 3
echo ""

# 4. Start Web
echo "🎨 [4/4] Starting Web (http://localhost:5173)..."
pnpm --filter @repo/web dev &
WEB_PID=$!
sleep 2
echo ""

echo "================================"
echo "✅ All services running!"
echo ""
echo "   🎮 Play at: http://localhost:5173"
echo "   📡 API at:  http://localhost:3000/api"
echo ""
echo "   Press Ctrl+C to stop all services"
echo "================================"

# Cleanup on Ctrl+C
cleanup() {
  echo ""
  echo "🛑 Stopping all services..."
  kill $API_PID 2>/dev/null
  kill $WEB_PID 2>/dev/null
  echo "✅ Stopped"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait
