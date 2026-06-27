#!/bin/bash
set -e

echo "🏯 Xiangqi Master — One-Time Setup"
echo "=================================="
echo ""

# 1. Install Node dependencies
echo "📦 [1/3] Installing dependencies..."
pnpm install

# 2. Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 [2/3] Created .env from .env.example"
  echo "   ⚠️  Edit .env to set ENGINE_PATH if needed"
else
  echo "📝 [2/3] .env already exists — skipping"
fi

# 3. Build Pikafish
echo "🔧 [3/3] Checking Pikafish..."
ENGINE_PATH=$(grep ENGINE_PATH .env 2>/dev/null | cut -d= -f2 || echo "")

if [ -z "$ENGINE_PATH" ]; then
  ENGINE_PATH="$HOME/.local/bin/pikafish"
fi

if [ -f "$ENGINE_PATH" ]; then
  echo "   ✅ Pikafish found at $ENGINE_PATH"
else
  echo "   ⚠️  Pikafish not found. Building from source..."
  echo ""
  echo "   This may take a few minutes..."

  OS=$(uname -s)
  ARCH=$(uname -m)

  if [ "$OS" = "Darwin" ] && [ "$ARCH" = "arm64" ]; then
    MAKE_ARCH="apple-silicon"
  elif [ "$OS" = "Linux" ]; then
    MAKE_ARCH="x86-64-modern"
  else
    echo "   ❌ Unsupported platform. Please build Pikafish manually."
    echo "   See: https://github.com/official-pikafish/Pikafish"
    exit 1
  fi

  git clone --depth 1 https://github.com/official-pikafish/Pikafish.git /tmp/Pikafish 2>/dev/null || true
  cd /tmp/Pikafish/src
  make -j8 build ARCH=$MAKE_ARCH

  mkdir -p "$HOME/.local/bin"
  cp pikafish "$HOME/.local/bin/"
  cp pikafish.nnue "$HOME/.local/bin/"

  # Update .env
  if grep -q "ENGINE_PATH" .env 2>/dev/null; then
    sed -i '' "s|ENGINE_PATH=.*|ENGINE_PATH=$HOME/.local/bin/pikafish|" .env 2>/dev/null || \
    sed -i "s|ENGINE_PATH=.*|ENGINE_PATH=$HOME/.local/bin/pikafish|" .env
  fi

  echo "   ✅ Pikafish built and installed to $HOME/.local/bin/"
  cd - > /dev/null
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "   Now run:  bash scripts/dev.sh"
echo "   Then open: http://localhost:5173"
