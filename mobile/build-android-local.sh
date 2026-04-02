#!/bin/bash
# ─────────────────────────────────────────────────────────────
# SplitEase — Local Android APK builder (no EAS queue)
# Builds directly on your Mac in ~5-10 minutes.
# ─────────────────────────────────────────────────────────────
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== SplitEase Android Local Build ===${NC}"

# ── 1. Check Java ────────────────────────────────────────────
if ! command -v java &>/dev/null; then
  echo -e "${RED}✗ Java not found.${NC}"
  echo "  Install: brew install --cask temurin@17"
  exit 1
fi
JAVA_VER=$(java -version 2>&1 | head -1)
echo -e "${GREEN}✓ Java:${NC} $JAVA_VER"

# ── 2. Check / set ANDROID_HOME ──────────────────────────────
if [ -z "$ANDROID_HOME" ]; then
  # Common Android Studio install location on macOS
  if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
    echo -e "${GREEN}✓ ANDROID_HOME:${NC} $ANDROID_HOME (auto-detected)"
  else
    echo -e "${RED}✗ ANDROID_HOME not set and Android SDK not found at ~/Library/Android/sdk${NC}"
    echo ""
    echo "  Install Android Studio from: https://developer.android.com/studio"
    echo "  Then open it once so it installs the SDK, and re-run this script."
    exit 1
  fi
else
  echo -e "${GREEN}✓ ANDROID_HOME:${NC} $ANDROID_HOME"
fi

# ── 3. Check node_modules ────────────────────────────────────
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}⚙ node_modules not found — running npm install...${NC}"
  npm install
fi
echo -e "${GREEN}✓ node_modules present${NC}"

# ── 4. Set API URL env var ───────────────────────────────────
export EXPO_PUBLIC_API_URL="https://split-ease-two.vercel.app"
echo -e "${GREEN}✓ API URL:${NC} $EXPO_PUBLIC_API_URL"

# ── 5. Run local EAS build ───────────────────────────────────
echo ""
echo -e "${YELLOW}⚙ Starting local Android APK build (no cloud queue)...${NC}"
echo "  This takes ~5-10 minutes on first run, faster after that."
echo ""

npx eas-cli build --platform android --profile preview --local

echo ""
echo -e "${GREEN}✓ Build complete!${NC}"
echo "  APK is saved in the current directory."
echo "  Install on your phone: adb install *.apk"
echo "  Or share the .apk file directly."
