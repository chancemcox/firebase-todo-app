#!/bin/bash

# Simple Docker test runner using existing node_modules
# Usage: ./scripts/test-docker-simple.sh [test-pattern] [timeout]

TEST_PATTERN=${1:-""}
TIMEOUT=${2:-30}

echo "🧪 Docker test run with ${TIMEOUT}s timeout..."

# Run tests with timeout
if [ -n "$TEST_PATTERN" ]; then
    echo "Running: $TEST_PATTERN"
    timeout $TIMEOUT docker run --rm \
        -v "$(pwd):/app" \
        -v "$(pwd)/node_modules:/app/node_modules" \
        --workdir /app \
        node:18-alpine \
        sh -c "cd /app && npm test -- --testPathPattern='$TEST_PATTERN' --verbose --maxWorkers=1"
else
    echo "Running all tests"
    timeout $TIMEOUT docker run --rm \
        -v "$(pwd):/app" \
        -v "$(pwd)/node_modules:/app/node_modules" \
        --workdir /app \
        node:18-alpine \
        sh -c "cd /app && npm test -- --verbose --maxWorkers=1"
fi

EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "⏰ Tests timed out after ${TIMEOUT}s - likely hanging!"
    echo "💡 Investigate the hanging test or increase timeout"
elif [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Tests completed successfully!"
else
    echo "❌ Tests failed or were interrupted (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
