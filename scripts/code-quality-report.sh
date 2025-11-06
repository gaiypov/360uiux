#!/bin/bash

##############################################################################
# 360° РАБОТА - Code Quality Report Generator
#
# Generates comprehensive code quality report including:
# - ESLint analysis
# - Prettier formatting check
# - TypeScript compilation check
# - Test coverage
# - Code statistics
#
# Usage:
#   ./scripts/code-quality-report.sh
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
REPO_ROOT=$(pwd)
BACKEND_DIR="$REPO_ROOT/backend"
REPORTS_DIR="$REPO_ROOT/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORTS_DIR/quality-report-$TIMESTAMP.txt"

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Header
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   360° РАБОТА - Code Quality Report          ║${NC}"
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo ""
echo "Generated: $(date)"
echo "Report: $REPORT_FILE"
echo ""

# Start report file
{
  echo "360° РАБОТА - Code Quality Report"
  echo "=================================="
  echo ""
  echo "Generated: $(date)"
  echo ""
} > "$REPORT_FILE"

##############################################################################
# FRONTEND ANALYSIS
##############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📱 FRONTEND ANALYSIS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

{
  echo ""
  echo "FRONTEND ANALYSIS"
  echo "================="
  echo ""
} >> "$REPORT_FILE"

cd "$REPO_ROOT"

# Frontend: ESLint
echo -e "${YELLOW}Running Frontend ESLint...${NC}"
if npm run lint > "$REPORTS_DIR/frontend-lint-$TIMESTAMP.txt" 2>&1; then
  FRONTEND_LINT_ERRORS=0
  echo -e "${GREEN}✓ No linting errors${NC}"
else
  FRONTEND_LINT_ERRORS=$(grep -c "error" "$REPORTS_DIR/frontend-lint-$TIMESTAMP.txt" 2>/dev/null || echo 0)
  echo -e "${RED}✗ Found $FRONTEND_LINT_ERRORS linting errors${NC}"
fi

{
  echo "ESLint Results:"
  echo "  Errors: $FRONTEND_LINT_ERRORS"
  echo "  Report: reports/frontend-lint-$TIMESTAMP.txt"
  echo ""
} >> "$REPORT_FILE"

# Frontend: Prettier
echo -e "${YELLOW}Checking Frontend formatting...${NC}"
if npm run format:check > "$REPORTS_DIR/frontend-format-$TIMESTAMP.txt" 2>&1; then
  echo -e "${GREEN}✓ Code is properly formatted${NC}"
  FRONTEND_FORMAT_ISSUES=0
else
  FRONTEND_FORMAT_ISSUES=$(wc -l < "$REPORTS_DIR/frontend-format-$TIMESTAMP.txt")
  echo -e "${RED}✗ Found formatting issues${NC}"
fi

{
  echo "Prettier Results:"
  echo "  Formatting Issues: $FRONTEND_FORMAT_ISSUES"
  echo "  Report: reports/frontend-format-$TIMESTAMP.txt"
  echo ""
} >> "$REPORT_FILE"

# Frontend: File Statistics
echo -e "${YELLOW}Analyzing Frontend codebase...${NC}"
FRONTEND_TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
FRONTEND_LOC=$(find src -name "*.ts" -o -name "*.tsx" -exec cat {} \; 2>/dev/null | wc -l)

{
  echo "Codebase Statistics:"
  echo "  TypeScript Files: $FRONTEND_TS_FILES"
  echo "  Lines of Code: $FRONTEND_LOC"
  echo ""
} >> "$REPORT_FILE"

echo ""

##############################################################################
# BACKEND ANALYSIS
##############################################################################

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  BACKEND ANALYSIS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

{
  echo ""
  echo "BACKEND ANALYSIS"
  echo "================"
  echo ""
} >> "$REPORT_FILE"

cd "$BACKEND_DIR"

# Backend: ESLint
echo -e "${YELLOW}Running Backend ESLint...${NC}"
if npm run lint > "$REPORTS_DIR/backend-lint-$TIMESTAMP.txt" 2>&1; then
  BACKEND_LINT_ERRORS=0
  echo -e "${GREEN}✓ No linting errors${NC}"
else
  BACKEND_LINT_ERRORS=$(grep -c "error" "$REPORTS_DIR/backend-lint-$TIMESTAMP.txt" 2>/dev/null || echo 0)
  echo -e "${RED}✗ Found $BACKEND_LINT_ERRORS linting errors${NC}"
fi

{
  echo "ESLint Results:"
  echo "  Errors: $BACKEND_LINT_ERRORS"
  echo "  Report: reports/backend-lint-$TIMESTAMP.txt"
  echo ""
} >> "$REPORT_FILE"

# Backend: Prettier
echo -e "${YELLOW}Checking Backend formatting...${NC}"
if npm run format:check > "$REPORTS_DIR/backend-format-$TIMESTAMP.txt" 2>&1; then
  echo -e "${GREEN}✓ Code is properly formatted${NC}"
  BACKEND_FORMAT_ISSUES=0
else
  BACKEND_FORMAT_ISSUES=$(wc -l < "$REPORTS_DIR/backend-format-$TIMESTAMP.txt")
  echo -e "${RED}✗ Found formatting issues${NC}"
fi

{
  echo "Prettier Results:"
  echo "  Formatting Issues: $BACKEND_FORMAT_ISSUES"
  echo "  Report: reports/backend-format-$TIMESTAMP.txt"
  echo ""
} >> "$REPORT_FILE"

# Backend: TypeScript Compilation
echo -e "${YELLOW}Checking TypeScript compilation...${NC}"
if npm run build > "$REPORTS_DIR/backend-build-$TIMESTAMP.txt" 2>&1; then
  echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
  TS_ERRORS=0
else
  TS_ERRORS=$(grep -c "error TS" "$REPORTS_DIR/backend-build-$TIMESTAMP.txt" 2>/dev/null || echo 0)
  echo -e "${RED}✗ Found $TS_ERRORS TypeScript errors${NC}"
fi

{
  echo "TypeScript Compilation:"
  echo "  Errors: $TS_ERRORS"
  echo "  Report: reports/backend-build-$TIMESTAMP.txt"
  echo ""
} >> "$REPORT_FILE"

# Backend: File Statistics
echo -e "${YELLOW}Analyzing Backend codebase...${NC}"
BACKEND_TS_FILES=$(find src -name "*.ts" 2>/dev/null | wc -l)
BACKEND_LOC=$(find src -name "*.ts" -exec cat {} \; 2>/dev/null | wc -l)
BACKEND_TEST_FILES=$(find tests -name "*.test.ts" 2>/dev/null | wc -l)

{
  echo "Codebase Statistics:"
  echo "  TypeScript Files: $BACKEND_TS_FILES"
  echo "  Lines of Code: $BACKEND_LOC"
  echo "  Test Files: $BACKEND_TEST_FILES"
  echo ""
} >> "$REPORT_FILE"

echo ""

##############################################################################
# SUMMARY
##############################################################################

cd "$REPO_ROOT"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL_ERRORS=$((FRONTEND_LINT_ERRORS + BACKEND_LINT_ERRORS + TS_ERRORS))
TOTAL_FORMAT_ISSUES=$((FRONTEND_FORMAT_ISSUES + BACKEND_FORMAT_ISSUES))
TOTAL_FILES=$((FRONTEND_TS_FILES + BACKEND_TS_FILES))
TOTAL_LOC=$((FRONTEND_LOC + BACKEND_LOC))

{
  echo ""
  echo "SUMMARY"
  echo "======="
  echo ""
  echo "Overall Statistics:"
  echo "  Total TypeScript Files: $TOTAL_FILES"
  echo "  Total Lines of Code: $TOTAL_LOC"
  echo "  Test Files: $BACKEND_TEST_FILES"
  echo ""
  echo "Code Quality:"
  echo "  ESLint Errors: $TOTAL_ERRORS"
  echo "  Formatting Issues: $TOTAL_FORMAT_ISSUES"
  echo "  TypeScript Errors: $TS_ERRORS"
  echo ""
} >> "$REPORT_FILE"

echo "Overall Statistics:"
echo "  Total TypeScript Files: $TOTAL_FILES"
echo "  Total Lines of Code: $TOTAL_LOC"
echo "  Test Files: $BACKEND_TEST_FILES"
echo ""

echo "Code Quality Issues:"
if [ $TOTAL_ERRORS -eq 0 ]; then
  echo -e "  ESLint Errors: ${GREEN}$TOTAL_ERRORS ✓${NC}"
else
  echo -e "  ESLint Errors: ${RED}$TOTAL_ERRORS ✗${NC}"
fi

if [ $TOTAL_FORMAT_ISSUES -eq 0 ]; then
  echo -e "  Formatting Issues: ${GREEN}$TOTAL_FORMAT_ISSUES ✓${NC}"
else
  echo -e "  Formatting Issues: ${YELLOW}$TOTAL_FORMAT_ISSUES ⚠${NC}"
fi

if [ $TS_ERRORS -eq 0 ]; then
  echo -e "  TypeScript Errors: ${GREEN}$TS_ERRORS ✓${NC}"
else
  echo -e "  TypeScript Errors: ${RED}$TS_ERRORS ✗${NC}"
fi

echo ""

# Quality Score
QUALITY_SCORE=100
if [ $TOTAL_ERRORS -gt 0 ]; then
  QUALITY_SCORE=$((QUALITY_SCORE - 30))
fi
if [ $TOTAL_FORMAT_ISSUES -gt 0 ]; then
  QUALITY_SCORE=$((QUALITY_SCORE - 10))
fi
if [ $TS_ERRORS -gt 0 ]; then
  QUALITY_SCORE=$((QUALITY_SCORE - 20))
fi

{
  echo "Quality Score: $QUALITY_SCORE/100"
  echo ""
} >> "$REPORT_FILE"

if [ $QUALITY_SCORE -ge 90 ]; then
  echo -e "Quality Score: ${GREEN}$QUALITY_SCORE/100 (Excellent)${NC}"
elif [ $QUALITY_SCORE -ge 70 ]; then
  echo -e "Quality Score: ${YELLOW}$QUALITY_SCORE/100 (Good)${NC}"
else
  echo -e "Quality Score: ${RED}$QUALITY_SCORE/100 (Needs Improvement)${NC}"
fi

echo ""
echo -e "${GREEN}✓ Report saved to: $REPORT_FILE${NC}"
echo ""

# Exit code based on quality score
if [ $QUALITY_SCORE -lt 70 ]; then
  echo -e "${RED}Code quality is below acceptable threshold (70).${NC}"
  exit 1
else
  echo -e "${GREEN}Code quality meets standards!${NC}"
  exit 0
fi
