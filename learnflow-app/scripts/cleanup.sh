#!/bin/bash

# ============================================================================
# LearnFlow App - Cleanup Script
# ============================================================================
# Clean up build artifacts, cache, and temporary files
#
# Usage:
#   ./scripts/cleanup.sh              # Clean all
#   ./scripts/cleanup.sh backend      # Clean backend cache
#   ./scripts/cleanup.sh frontend     # Clean frontend cache
#   ./scripts/cleanup.sh docker       # Clean Docker containers/images
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

cleanup_backend() {
  echo -e "${BLUE}=== Cleaning Backend ===${NC}"
  echo ""

  for service in user-service product-service order-service chat-service; do
    echo -e "${YELLOW}Cleaning $service...${NC}"
    cd "$PROJECT_ROOT/app/backend/$service"

    # Remove Python cache
    find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
    find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
    find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true

    # Remove virtual environments if any
    rm -rf venv 2>/dev/null || true
    rm -rf env 2>/dev/null || true

    echo -e "${GREEN}✅ $service cleaned${NC}"
    cd "$PROJECT_ROOT"
  done

  echo ""
}

cleanup_frontend() {
  echo -e "${BLUE}=== Cleaning Frontend ===${NC}"
  echo ""

  cd "$PROJECT_ROOT/app/frontend"

  if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
  fi

  if [ -d ".next" ]; then
    echo "Removing .next build cache..."
    rm -rf .next
  fi

  if [ -d "out" ]; then
    echo "Removing out directory..."
    rm -rf out
  fi

  # Remove any lock files if requested
  # rm -f package-lock.json yarn.lock

  echo -e "${GREEN}✅ Frontend cleaned${NC}"
  cd "$PROJECT_ROOT"
  echo ""
}

cleanup_docker() {
  echo -e "${BLUE}=== Cleaning Docker ===${NC}"
  echo ""

  if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not installed${NC}"
    return
  fi

  # Stop and remove containers
  echo "Stopping Docker containers..."
  docker-compose down 2>/dev/null || true

  # Remove learnflow images
  echo "Removing learnflow Docker images..."
  docker images | grep learnflow | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

  # Remove dangling images
  echo "Removing dangling images..."
  docker image prune -f 2>/dev/null || true

  echo -e "${GREEN}✅ Docker cleaned${NC}"
  echo ""
}

cleanup_cache() {
  echo -e "${BLUE}=== Cleaning Cache Files ===${NC}"
  echo ""

  # Python cache
  find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
  find . -type f -name "*.pyc" -delete 2>/dev/null || true

  # Node cache
  find . -type d -name node_modules -exec rm -rf {} + 2>/dev/null || true

  # npm/yarn cache (optional)
  # rm -rf ~/.npm ~/.yarn

  echo -e "${GREEN}✅ Cache cleaned${NC}"
  echo ""
}

cleanup_all() {
  echo -e "${BLUE}=== Cleaning All ===${NC}"
  echo ""

  cleanup_backend
  cleanup_frontend
  cleanup_docker
  cleanup_cache

  echo -e "${GREEN}✅ Complete cleanup finished${NC}"
}

# ============================================================================
# Main
# ============================================================================

case "${1:-all}" in
  backend)
    cleanup_backend
    ;;
  frontend)
    cleanup_frontend
    ;;
  docker)
    cleanup_docker
    ;;
  cache)
    cleanup_cache
    ;;
  all)
    cleanup_all
    ;;
  *)
    echo "Usage: $0 {all|backend|frontend|docker|cache}"
    echo ""
    echo "  all        - Clean all build artifacts and cache"
    echo "  backend    - Clean Python cache only"
    echo "  frontend   - Clean Node.js build artifacts"
    echo "  docker     - Stop and remove Docker containers/images"
    echo "  cache      - Clean all cache files"
    exit 1
    ;;
esac
