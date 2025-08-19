#!/bin/bash

# macOS-compatible Docker test runner
# Usage: ./test-docker-mac.sh [test-pattern] [timeout]

TEST_PATTERN=${1:-""}
TIMEOUT=${2:-30}

echo "🧪 Docker test run with ${TIMEOUT}s timeout..."

# Function to run tests with timeout
run_tests_with_timeout() {
    local test_pattern="$1"
    local timeout_seconds="$2"
    
    if [ -n "$test_pattern" ]; then
        echo "Running: $test_pattern"
        docker run --rm \
            -v "$(pwd):/app" \
            -v "$(pwd)/node_modules:/app/node_modules" \
            --workdir /app \
            node:18-alpine \
            sh -c "cd /app && timeout ${timeout_seconds}s npm test -- --testPathPattern='$test_pattern' --verbose --maxWorkers=1"
    else
        echo "Running all tests"
        docker run --rm \
            -v "$(pwd):/app" \
            -v "$(pwd)/node_modules:/app/node_modules" \
            --workdir /app \
            node:18-alpine \
            sh -c "cd /app && timeout ${timeout_seconds}s npm test -- --verbose --maxWorkers=1"
    fi
}

# Run tests and capture the result
run_tests_with_timeout "$TEST_PATTERN" "$TIMEOUT"
EXIT_CODE=$?

# Check the exit code
if [ $EXIT_CODE -eq 124 ]; then
    echo "⏰ Tests timed out after ${TIMEOUT}s - likely hanging!"
    echo "💡 Investigate the hanging test or increase timeout"
elif [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Tests completed successfully!"
else
    echo "❌ Tests failed or were interrupted (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
