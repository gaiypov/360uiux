#!/bin/bash

##############################################################################
# 360° РАБОТА - Stress Test Runner
#
# Runs all k6 stress tests and generates comprehensive reports
#
# Prerequisites:
#   - k6 installed (https://k6.io/docs/getting-started/installation)
#   - Backend server running
#
# Usage:
#   ./run-all-tests.sh [environment]
#
# Examples:
#   ./run-all-tests.sh local
#   ./run-all-tests.sh staging
#   ./run-all-tests.sh production
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-local}
RESULTS_DIR="./results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="$RESULTS_DIR/report_$TIMESTAMP"

# Environment URLs
case $ENVIRONMENT in
  local)
    BASE_URL="http://localhost:5000"
    WS_URL="ws://localhost:5000"
    ;;
  staging)
    BASE_URL="https://staging-api.360rabota.ru"
    WS_URL="wss://staging-api.360rabota.ru"
    ;;
  production)
    BASE_URL="https://api.360rabota.ru"
    WS_URL="wss://api.360rabota.ru"
    ;;
  *)
    echo -e "${RED}Error: Unknown environment '$ENVIRONMENT'${NC}"
    echo "Usage: $0 [local|staging|production]"
    exit 1
    ;;
esac

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Install k6 from: https://k6.io/docs/getting-started/installation"
    exit 1
fi

# Create report directory
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  360° РАБОТА - Stress Test Suite${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo -e "Base URL:    ${GREEN}$BASE_URL${NC}"
echo -e "WebSocket:   ${GREEN}$WS_URL${NC}"
echo -e "Report Dir:  ${GREEN}$REPORT_DIR${NC}"
echo ""
echo -e "${YELLOW}Starting tests at $(date)${NC}"
echo ""

# Array to track test results
declare -a TEST_RESULTS

# Function to run a test
run_test() {
    local test_name=$1
    local test_file=$2
    local description=$3

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running: $test_name${NC}"
    echo -e "${BLUE}Description: $description${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    local start_time=$(date +%s)

    if k6 run \
        -e BASE_URL="$BASE_URL" \
        -e WS_URL="$WS_URL" \
        --summary-export="$REPORT_DIR/${test_name}-summary.json" \
        --out json="$REPORT_DIR/${test_name}-raw.json" \
        "$test_file"; then

        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        echo ""
        echo -e "${GREEN}✓ $test_name completed successfully (${duration}s)${NC}"
        echo ""
        TEST_RESULTS+=("PASS: $test_name ($duration s)")
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        echo ""
        echo -e "${RED}✗ $test_name failed (${duration}s)${NC}"
        echo ""
        TEST_RESULTS+=("FAIL: $test_name ($duration s)")
    fi

    sleep 5 # Cool down between tests
}

# Run all tests
run_test "api-endpoints" \
    "./api-endpoints.test.js" \
    "Tests critical API endpoints under various load scenarios"

run_test "chat-load" \
    "./chat-load.test.js" \
    "Tests chat messaging system under load"

run_test "database" \
    "./database.test.js" \
    "Tests database performance with read/write operations"

run_test "websocket" \
    "./websocket.test.js" \
    "Tests WebSocket connections and real-time messaging"

# Generate summary report
SUMMARY_FILE="$REPORT_DIR/summary.txt"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

{
    echo "360° РАБОТА - Stress Test Summary"
    echo "=================================="
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Base URL: $BASE_URL"
    echo "Timestamp: $(date)"
    echo ""
    echo "Test Results:"
    echo "-------------"
} > "$SUMMARY_FILE"

PASS_COUNT=0
FAIL_COUNT=0

for result in "${TEST_RESULTS[@]}"; do
    echo "$result" | tee -a "$SUMMARY_FILE"
    if [[ $result == PASS* ]]; then
        ((PASS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
done

echo "" | tee -a "$SUMMARY_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$SUMMARY_FILE"
echo "Total: ${#TEST_RESULTS[@]} tests" | tee -a "$SUMMARY_FILE"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}" | tee -a "$SUMMARY_FILE"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Failed: $FAIL_COUNT${NC}" | tee -a "$SUMMARY_FILE"
else
    echo "Failed: $FAIL_COUNT" | tee -a "$SUMMARY_FILE"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$SUMMARY_FILE"
echo ""

echo -e "${YELLOW}Reports saved to: $REPORT_DIR${NC}"
echo ""

# Exit with error if any test failed
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Some tests failed. Check the reports for details.${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed successfully!${NC}"
    exit 0
fi
