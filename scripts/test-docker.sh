#!/bin/bash

# Test runner script for Docker
# Usage: ./scripts/test-docker.sh [test-pattern] [timeout-seconds]

TEST_PATTERN=${1:-""}
TIMEOUT=${2:-60}

echo "🚀 Running tests in Docker..."
echo "Test pattern: ${TEST_PATTERN:-'all tests'}"
echo "Timeout: ${TIMEOUT}s"

# Build the test image
echo "📦 Building test Docker image..."
docker build -f Dockerfile.test -t firebase-todo-tests .

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Docker image"
    exit 1
fi

# Run tests with timeout
echo "🧪 Running tests..."
if [ -n "$TEST_PATTERN" ]; then
    # Run specific test pattern
    timeout $TIMEOUT docker run --rm \
        -v $(pwd):/app \
        -v /app/node_modules \
        firebase-todo-tests \
        npm test -- --testPathPattern="$TEST_PATTERN" --verbose --maxWorkers=1
else
    # Run all tests
    timeout $TIMEOUT docker run --rm \
        -v $(pwd):/app \
        -v /app/node_modules \
        firebase-todo-tests \
        npm test -- --verbose --maxWorkers=1
fi

EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "⏰ Tests timed out after ${TIMEOUT}s"
    echo "💡 You can increase timeout or investigate hanging tests"
elif [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
