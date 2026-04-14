#!/bin/bash

# ============================================================================
# LearnFlow App - Build Script
# ============================================================================
# Build all services (backend containers + frontend static)
#
# Usage:
#   ./scripts/build.sh              # Build all services
#   ./scripts/build.sh backend      # Build backend only
#   ./scripts/build.sh frontend     # Build frontend only
#   ./scripts/build.sh docker       # Build Docker images
#
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# Functions
# ============================================================================

build_backend() {
  echo -e "${BLUE}=== Building Backend Services ===${NC}"
  echo ""

  for service in user-service product-service order-service chat-service; do
    echo -e "${YELLOW}Building $service...${NC}"
    cd "$PROJECT_ROOT/app/backend/$service"

    # Install Python dependencies
    if [ -f "requirements.txt" ]; then
      pip install -r requirements.txt --quiet
      echo -e "${GREEN}✅ $service dependencies installed${NC}"
    fi

    cd "$PROJECT_ROOT"
  done

  echo -e "${GREEN}✅ Backend services built${NC}"
  echo ""
}

build_frontend() {
  echo -e "${BLUE}=== Building Frontend ===${NC}"
  echo ""

  cd "$PROJECT_ROOT/app/frontend"

  if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
      echo "Installing dependencies..."
      npm install --legacy-peer-deps --quiet

      echo "Building Next.js application..."
      npm run build

      echo -e "${GREEN}✅ Frontend built successfully${NC}"
    else
      echo -e "${RED}❌ npm not installed${NC}"
      exit 1
    fi
  else
    echo -e "${RED}❌ No package.json found${NC}"
    exit 1
  fi

  cd "$PROJECT_ROOT"
  echo ""
}

build_docker() {
  echo -e "${BLUE}=== Building Docker Images ===${NC}"
  echo ""

  if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    exit 1
  fi

  echo "Building backend services..."
  for service in user-service product-service order-service chat-service; do
    echo -e "${YELLOW}Building $service Docker image...${NC}"
    docker build -t "learnflow-$service" "./app/backend/$service"
    echo -e "${GREEN}✅ $service built${NC}"
  done

  echo -e "${GREEN}✅ Docker images built${NC}"
  echo ""
}

# ============================================================================
# Main
# ============================================================================

case "${1:-all}" in
  backend)
    build_backend
    ;;
  frontend)
    build_frontend
    ;;
  docker)
    build_docker
    ;;
  all)
    build_backend
    build_frontend
    ;;
  *)
    echo "Usage: $0 {all|backend|frontend|docker}"
    echo ""
    echo "  all        - Build backend + frontend"
    echo "  backend    - Build Python backend services only"
    echo "  frontend   - Build Next.js frontend only"
    echo "  docker     - Build Docker images for services"
    exit 1
    ;;
esac

echo -e "${GREEN}✅ Build complete${NC}"
