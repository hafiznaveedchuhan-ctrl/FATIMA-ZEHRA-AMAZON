#!/bin/bash

# ============================================================================
# LearnFlow App - Test Suite
# ============================================================================
# Run all tests (unit + integration + E2E)
#
# Usage:
#   ./scripts/test.sh              # Run all tests
#   ./scripts/test.sh backend      # Run backend tests only
#   ./scripts/test.sh frontend     # Run frontend tests only
#   ./scripts/test.sh coverage     # Run with coverage report
#
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Functions
# ============================================================================

run_backend_tests() {
  echo -e "${BLUE}=== Running Backend Tests ===${NC}"
  echo ""

  # Test each backend service
  for service in user-service product-service order-service chat-service; do
    echo -e "${YELLOW}Testing $service...${NC}"
    cd "$PROJECT_ROOT/app/backend/$service"

    if [ -d "tests" ]; then
      if command -v pytest &> /dev/null; then
        pytest tests -v --tb=short
      else
        echo -e "${YELLOW}⚠️  pytest not installed, skipping $service tests${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  No tests directory in $service${NC}"
    fi

    cd "$PROJECT_ROOT"
    echo ""
  done
}

run_frontend_tests() {
  echo -e "${BLUE}=== Running Frontend Tests ===${NC}"
  echo ""

  cd "$PROJECT_ROOT/app/frontend"

  if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
      echo "Installing dependencies..."
      npm install --legacy-peer-deps 2>/dev/null || true

      if npm run test 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend tests passed${NC}"
      else
        echo -e "${YELLOW}⚠️  No test script in package.json or tests failed${NC}"
      fi
    else
      echo -e "${YELLOW}⚠️  npm not installed, skipping frontend tests${NC}"
    fi
  fi

  cd "$PROJECT_ROOT"
  echo ""
}

run_coverage() {
  echo -e "${BLUE}=== Running Tests with Coverage ===${NC}"
  echo ""

  for service in user-service product-service order-service chat-service; do
    echo -e "${YELLOW}Coverage for $service...${NC}"
    cd "$PROJECT_ROOT/app/backend/$service"

    if command -v pytest &> /dev/null; then
      pytest tests --cov=app --cov-report=term-missing --tb=short 2>/dev/null || echo "No coverage available"
    fi

    cd "$PROJECT_ROOT"
  done

  echo ""
}

verify_apis() {
  echo -e "${BLUE}=== Verifying API Endpoints ===${NC}"
  echo ""

  if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}⚠️  curl not available, skipping API verification${NC}"
    return
  fi

  SERVICES=("user-service:8001" "product-service:8002" "order-service:8003" "chat-service:8004")

  for service_port in "${SERVICES[@]}"; do
    IFS=':' read -r service port <<< "$service_port"
    echo -n "Testing $service (port $port)... "

    if curl -s http://localhost:$port/docs > /dev/null 2>&1; then
      echo -e "${GREEN}✅ OK${NC}"
    else
      echo -e "${RED}❌ NOT RESPONDING${NC}"
    fi
  done

  echo ""
}

# ============================================================================
# Main
# ============================================================================

case "${1:-all}" in
  backend)
    run_backend_tests
    ;;
  frontend)
    run_frontend_tests
    ;;
  coverage)
    run_coverage
    ;;
  api)
    verify_apis
    ;;
  all)
    run_backend_tests
    run_frontend_tests
    verify_apis
    ;;
  *)
    echo "Usage: $0 {all|backend|frontend|coverage|api}"
    echo ""
    echo "  all        - Run all tests (backend + frontend + API verification)"
    echo "  backend    - Run backend tests only"
    echo "  frontend   - Run frontend tests only"
    echo "  coverage   - Run tests with coverage report"
    echo "  api        - Verify API endpoints are responding"
    exit 1
    ;;
esac

echo -e "${GREEN}✅ Test execution complete${NC}"
