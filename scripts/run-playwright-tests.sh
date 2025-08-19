#!/bin/bash

# Playwright Test Runner and File Organizer Script
# This script runs Playwright tests and organizes all outputs into the test-results folder

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_RESULTS_DIR="test-results"
PLAYWRIGHT_OUTPUT_DIR="$TEST_RESULTS_DIR/playwright-output"
PLAYWRIGHT_REPORT_DIR="$TEST_RESULTS_DIR/playwright-report"
COVERAGE_DIR="$TEST_RESULTS_DIR/coverage"
LOGS_DIR="logs"

echo -e "${BLUE}🎭 Playwright Test Runner and File Organizer${NC}"
echo "================================================"

# Create necessary directories if they don't exist
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p "$TEST_RESULTS_DIR"
mkdir -p "$PLAYWRIGHT_OUTPUT_DIR"
mkdir -p "$PLAYWRIGHT_REPORT_DIR"
mkdir -p "$COVERAGE_DIR"
mkdir -p "$LOGS_DIR"

# Clean up any existing test artifacts in root directory
echo -e "${YELLOW}🧹 Cleaning up existing test artifacts...${NC}"
find . -maxdepth 1 -name "*.png" -type f -exec mv {} "$TEST_RESULTS_DIR/" \; 2>/dev/null || true
find . -maxdepth 1 -name "*.mp4" -type f -exec mv {} "$TEST_RESULTS_DIR/" \; 2>/dev/null || true
find . -maxdepth 1 -name "*.webm" -type f -exec mv {} "$TEST_RESULTS_DIR/" \; 2>/dev/null || true

# Remove any duplicate test directories in root
echo -e "${YELLOW}🗑️  Removing duplicate test directories...${NC}"
if [ -d "coverage" ] && [ "$(realpath coverage)" != "$(realpath $COVERAGE_DIR)" ]; then
    rm -rf coverage
fi
if [ -d "playwright-report" ] && [ "$(realpath playwright-report)" != "$(realpath $PLAYWRIGHT_REPORT_DIR)" ]; then
    rm -rf playwright-report
fi

# Run Playwright tests
echo -e "${BLUE}🚀 Running Playwright tests...${NC}"
echo "This may take a few minutes..."

# Capture the start time
START_TIME=$(date +%s)

# Run the tests and capture output
if npm run test:e2e > "$LOGS_DIR/playwright-output.log" 2>&1; then
    echo -e "${GREEN}✅ Playwright tests completed successfully!${NC}"
    TEST_STATUS="SUCCESS"
else
    echo -e "${RED}❌ Playwright tests failed, but continuing with file organization...${NC}"
    TEST_STATUS="FAILED"
fi

# Capture the end time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${BLUE}📊 Test execution completed in ${DURATION} seconds${NC}"

# Organize test outputs
echo -e "${YELLOW}📦 Organizing test outputs...${NC}"

# Move any new screenshots, videos, or other test artifacts to test-results
echo "Moving test artifacts to $TEST_RESULTS_DIR/..."

# Find and move all test-related files from root and subdirectories
find . -maxdepth 2 -name "*.png" -type f -not -path "./$TEST_RESULTS_DIR/*" -not -path "./node_modules/*" -exec mv {} "$TEST_RESULTS_DIR/" \; 2>/dev/null || true
find . -maxdepth 2 -name "*.mp4" -type f -not -path "./$TEST_RESULTS_DIR/*" -not -path "./node_modules/*" -exec mv {} "$TEST_RESULTS_DIR/" \; 2>/dev/null || true
find . -maxdepth 2 -name "*.webm" -type f -not -path "./$TEST_RESULTS_DIR/*" -not -path "./node_modules/*" -exec mv {} "$TEST_RESULTS_DIR/" \; 2>/dev/null || true

# Move any coverage reports
if [ -d "coverage" ] && [ "$(realpath coverage)" != "$(realpath $COVERAGE_DIR)" ]; then
    echo "Moving coverage reports..."
    cp -r coverage/* "$COVERAGE_DIR/" 2>/dev/null || true
    rm -rf coverage
fi

# Move any Playwright reports
if [ -d "playwright-report" ] && [ "$(realpath playwright-report)" != "$(realpath $PLAYWRIGHT_REPORT_DIR)" ]; then
    echo "Moving Playwright reports..."
    cp -r playwright-report/* "$PLAYWRIGHT_REPORT_DIR/" 2>/dev/null || true
    rm -rf playwright-report
fi

# Generate a summary of what was organized
echo -e "${YELLOW}📋 Generating organization summary...${NC}"

# Count files in test-results
PNG_COUNT=$(find "$TEST_RESULTS_DIR" -name "*.png" -type f | wc -l | tr -d ' ')
MP4_COUNT=$(find "$TEST_RESULTS_DIR" -name "*.mp4" -type f | wc -l | tr -d ' ')
WEBM_COUNT=$(find "$TEST_RESULTS_DIR" -name "*.webm" -type f | wc -l | tr -d ' ')
TOTAL_ARTIFACTS=$((PNG_COUNT + MP4_COUNT + WEBM_COUNT))

# Create a summary report
SUMMARY_FILE="$TEST_RESULTS_DIR/test-run-summary-$(date +%Y%m%d-%H%M%S).md"
cat > "$SUMMARY_FILE" << EOF
# Test Run Summary - $(date)

## Test Execution
- **Status**: $TEST_STATUS
- **Duration**: ${DURATION} seconds
- **Completed**: $(date)

## Files Organized
- **PNG Screenshots**: $PNG_COUNT
- **MP4 Videos**: $MP4_COUNT
- **WebM Videos**: $WEBM_COUNT
- **Total Artifacts**: $TOTAL_ARTIFACTS

## Directory Structure
- **Test Results**: $TEST_RESULTS_DIR/
- **Playwright Output**: $PLAYWRIGHT_OUTPUT_DIR/
- **Playwright Reports**: $PLAYWRIGHT_REPORT_DIR/
- **Coverage Reports**: $COVERAGE_DIR/
- **Logs**: $LOGS_DIR/

## Test Logs
- **Playwright Output**: $LOGS_DIR/playwright-output.log

## Next Steps
1. View test results in: $PLAYWRIGHT_REPORT_DIR/index.html
2. Check coverage in: $COVERAGE_DIR/lcov-report/index.html
3. Review screenshots in: $TEST_RESULTS_DIR/
EOF

echo -e "${GREEN}✅ File organization completed!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo "  - PNG files: $PNG_COUNT"
echo "  - MP4 files: $MP4_COUNT"
echo "  - WebM files: $WEBM_COUNT"
echo "  - Total artifacts: $TOTAL_ARTIFACTS"

echo -e "${BLUE}📁 All test outputs organized in: $TEST_RESULTS_DIR/${NC}"
echo -e "${BLUE}📋 Summary report: $SUMMARY_FILE${NC}"
echo -e "${BLUE}📖 Test logs: $LOGS_DIR/playwright-output.log${NC}"

# Final status
if [ "$TEST_STATUS" = "SUCCESS" ]; then
    echo -e "${GREEN}🎉 All done! Tests passed and files are organized.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Tests had issues, but files are organized. Check logs for details.${NC}"
    exit 1
fi
