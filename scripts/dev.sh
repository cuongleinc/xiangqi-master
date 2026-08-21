#!/bin/bash
set -e

echo "🏯 Xiangqi Master — Starting..."
echo "================================"
echo ""

# 1. Check Docker daemon
echo "🐳 [1/5] Checking Docker..."
if ! docker info >/dev/null 2>&1; then
  echo "   ❌ Docker is not running."
  echo "   Start Docker Desktop, wait for it to finish booting, then run: bash scripts/dev.sh"
  exit 1
fi
echo "   ✅ Docker is running"
echo ""

# 2. Start Docker services (PostgreSQL + Redis)
echo "🐘 [2/5] Starting PostgreSQL + Redis..."
docker compose -f docker-compose.dev.yml up -d
echo "   ✅ Database & cache ready"
echo ""

# 3. Build packages
echo "🔨 [3/5] Building packages..."
if ! pnpm run build; then
  echo "   ⚠️  Package build failed — continuing with existing dist/ if present"
fi
echo ""

# 4. Start API and wait until it actually answers
echo "🔧 [4/5] Starting API (http://localhost:3000)..."
pnpm --filter @repo/api dev > /tmp/xiangqi-api.log 2>&1 &
API_PID=$!

API_READY=0
for _ in $(seq 1 45); do
  if curl -sf http://localhost:3000/api/engine/status >/dev/null 2>&1; then
    API_READY=1
    break
  fi
  if ! kill -0 $API_PID 2>/dev/null; then
    break
  fi
  sleep 2
done

if [ "$API_READY" != "1" ]; then
  echo ""
  echo "   ❌ API did not become ready. Last log lines (full log: /tmp/xiangqi-api.log):"
  tail -20 /tmp/xiangqi-api.log 2>/dev/null
  echo ""
  echo "   Common causes: PostgreSQL/Redis containers not healthy, or Pikafish missing at ENGINE_PATH."
  exit 1
fi
echo "   ✅ API ready"
echo ""

# 5. Start Web
echo "🎨 [5/5] Starting Web (http://localhost:5173)..."
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
