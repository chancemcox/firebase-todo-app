#!/bin/bash

# Comprehensive Test Runner and Organizer
# This script runs all tests and then organizes the results
# Usage: npm run test:run:all

set -e

echo "🚀 Starting comprehensive test suite..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to run tests with timeout
run_test_with_timeout() {
    local test_name="$1"
    local test_command="$2"
    local timeout_seconds="${3:-300}"  # Default 5 minutes
    
    echo "🧪 Running $test_name..."
    echo "⏰ Timeout: ${timeout_seconds}s"
    
    if timeout $timeout_seconds bash -c "$test_command"; then
        echo "✅ $test_name completed successfully"
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            echo "⏰ $test_name timed out after ${timeout_seconds}s"
            return 1
        else
            echo "❌ $test_name failed with exit code $exit_code"
            return $exit_code
        fi
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if timeout command exists
if ! command_exists timeout; then
    echo "⚠️  'timeout' command not found. Installing gnu-timeout..."
    if command_exists brew; then
        brew install coreutils
        export PATH="/usr/local/opt/coreutils/libexec/gnubin:$PATH"
    else
        echo "❌ Please install 'timeout' command or use 'gtimeout' from coreutils"
        exit 1
    fi
fi

# Run Jest unit tests with coverage
echo ""
echo "📊 Running Jest unit tests with coverage..."
run_test_with_timeout "Jest Unit Tests" "npm run test:coverage" 300

# Run Playwright E2E tests
echo ""
echo "🎭 Running Playwright E2E tests..."
run_test_with_timeout "Playwright E2E Tests" "npm run test:e2e" 600

# Run linting
echo ""
echo "🔍 Running ESLint..."
run_test_with_timeout "ESLint" "npm run lint" 120

# Organize all test results
echo ""
echo "🧹 Organizing test results..."
./scripts/organize-test-results.sh

# Show summary
echo ""
echo "📋 Test Summary:"
echo "=================="

# Check Jest coverage
if [ -f "test-results/coverage/lcov-report/index.html" ]; then
    echo "✅ Jest coverage: test-results/coverage/lcov-report/index.html"
else
    echo "❌ Jest coverage not found"
fi

# Check Playwright report
if [ -f "test-results/playwright-report/index.html" ]; then
    echo "✅ Playwright report: test-results/playwright-report/index.html"
else
    echo "❌ Playwright report not found"
fi

# Check logs
if [ -d "logs" ] && [ "$(ls -A logs)" ]; then
    echo "✅ Test logs: logs/"
    echo "   - $(ls logs/*.log | wc -l | tr -d ' ') log files"
else
    echo "❌ No test logs found"
fi

# Show any failures
echo ""
echo "🔍 Checking for test failures..."

# Check Jest output
if [ -f "logs/test-output.log" ]; then
    if grep -q "FAIL\|✗\|✖" logs/test-output.log; then
        echo "❌ Jest tests had failures. Check logs/test-output.log"
    else
        echo "✅ Jest tests passed"
    fi
fi

# Check Playwright output
if [ -f "logs/playwright-output.log" ]; then
    if grep -q "FAIL\|✗\|✖\|Error\|failed" logs/playwright-output.log; then
        echo "❌ Playwright tests had failures. Check logs/playwright-output.log"
    else
        echo "✅ Playwright tests passed"
    fi
fi

# Check linting output
if [ -f "logs/lint-output.log" ]; then
    if grep -q "error\|Error\|✗\|✖" logs/lint-output.log; then
        echo "❌ ESLint found issues. Check logs/lint-output.log"
    else
        echo "✅ ESLint passed"
    fi
fi

echo ""
echo "🎉 Comprehensive test suite complete!"
echo "💡 View results in the test-results/ directory"
echo "💡 Check logs in the logs/ directory"
echo ""
echo "📱 Quick access:"
echo "   - npm run test:organize    # Reorganize results anytime"
echo "   - npm run test:run:all     # Run all tests again"
echo "   - npm run test:e2e:ui      # Run Playwright with UI"
echo "   - npm run test:watch       # Run Jest in watch mode"
