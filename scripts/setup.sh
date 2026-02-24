#!/bin/bash
#
# ThumbCode Development Setup Script
#
# This script sets up your local development environment.
# Run it once after cloning the repository.
#
# Usage:
#   ./scripts/setup.sh
#
# Or with pnpm:
#   pnpm setup
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
  echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
  echo -e "${RED}[✗]${NC} $1"
}

# Header
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}            ${GREEN}ThumbCode Development Setup${NC}                  ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for required tools
print_status "Checking required tools..."

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed"
  echo "  Please install Node.js 18+ from https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  print_error "Node.js version 18+ is required (found v$NODE_VERSION)"
  exit 1
fi
print_success "Node.js $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  print_warning "pnpm is not installed"
  print_status "Installing pnpm..."
  npm install -g pnpm
fi
print_success "pnpm $(pnpm -v)"

# Check for .env.local
print_status "Checking environment configuration..."

if [ ! -f ".env.local" ]; then
  print_warning ".env.local not found"
  print_status "Creating .env.local from .env.example..."
  cp .env.example .env.local
  print_success "Created .env.local"
  echo ""
  print_warning "Please edit .env.local and add your configuration values"
  echo "  See docs/ENVIRONMENT.md for detailed setup instructions"
  echo ""
else
  print_success ".env.local exists"
fi

# Install dependencies
print_status "Installing dependencies..."
pnpm install
print_success "Dependencies installed"

# Run type check
print_status "Running type check..."
if pnpm typecheck; then
  print_success "Type check passed"
else
  print_warning "Type check has errors (this may be expected for a fresh setup)"
fi

# Summary
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                  ${GREEN}Setup Complete!${NC}                         ${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Next steps:"
echo ""
echo "  1. Edit .env.local with your configuration values"
echo "     - Add VITE_GITHUB_CLIENT_ID for GitHub auth"
echo ""
echo "  2. Start the Vite development server:"
echo "     pnpm dev"
echo ""
echo "  3. Build for native platforms with Capacitor:"
echo "     pnpm build && npx cap sync"
echo "     npx cap open ios      # Open in Xcode"
echo "     npx cap open android  # Open in Android Studio"
echo ""
echo "For more information, see:"
echo "  - docs/memory-bank/techContext.md - Current tech stack & setup"
echo "  - CONTRIBUTING.md - Contributing guidelines"
echo "  - CLAUDE.md - AI agent guidelines"
echo ""
