#!/bin/bash
# Phase 5: E2E Test Suite Runner
# Fatima Zehra Boutique
#
# Each test file runs as a separate pytest process to avoid
# sys.path conflicts between service modules (user-service, product-service,
# order-service, chat-service all use 'app' as their package name).

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  PHASE 5: E2E TEST SUITE"
echo "  Fatima Zehra Boutique"
echo "=========================================="
echo ""

run_test() {
    local test_file="$1"
    local marker="$2"
    local label="$3"

    echo -e "${YELLOW}--- Running: $label ---${NC}"
    local cmd="python3 -m pytest $test_file -v --tb=short"
    if [ -n "$marker" ]; then
        cmd="$cmd -m $marker"
    fi

    if eval "$cmd"; then
        echo -e "${GREEN}PASSED: $label${NC}"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "${RED}FAILED: $label${NC}"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
}

echo "=== UNIT TESTS ==="
echo ""

run_test "tests/unit/test_user_service.py" "unit" "User Service Unit Tests"
run_test "tests/unit/test_product_service.py" "unit" "Product Service Unit Tests"
run_test "tests/unit/test_order_service.py" "unit" "Order Service Unit Tests"
run_test "tests/unit/test_chat_service.py" "unit" "Chat Service Unit Tests"
run_test "tests/unit/test_stripe_client.py" "unit" "Stripe Client Unit Tests"

echo "=== INTEGRATION TESTS ==="
echo ""

run_test "tests/integration/test_isolated_journey.py" "integration" "User Journey Integration Tests"
run_test "tests/integration/test_isolated_order_journey.py" "integration" "Order Journey Integration Tests"

echo ""
echo "=========================================="
echo "  TEST SUMMARY"
echo "=========================================="
echo ""
echo "  Test Suites Run:    $TOTAL_TESTS"
echo -e "  ${GREEN}Passed:             $PASS_COUNT${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "  ${RED}Failed:             $FAIL_COUNT${NC}"
else
    echo -e "  Failed:             $FAIL_COUNT"
fi
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}  ALL TESTS PASSED${NC}"
    echo "=========================================="
    exit 0
else
    echo -e "${RED}  SOME TESTS FAILED${NC}"
    echo "=========================================="
    exit 1
fi
