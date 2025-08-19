#!/bin/bash

# Quick Docker test runner (skips npm ci for speed)
# Usage: ./quick-test-docker.sh [test-pattern]

TEST_PATTERN=${1:-""}

echo "🧪 Quick Docker test run (no npm ci)..."

# Run tests directly (assumes node_modules exists)
if [ -n "$TEST_PATTERN" ]; then
    echo "Running: $TEST_PATTERN"
    docker run --rm \
        -v "$(pwd):/app" \
        -v /app/node_modules \
        --workdir /app \
        node:18-alpine \
        sh -c "timeout 30s npm test -- --testPathPattern='$TEST_PATTERN' --verbose --maxWorkers=1"
else
    echo "Running all tests"
    docker run --rm \
        -v "$(pwd):/app" \
        -v /app/node_modules \
        --workdir /app \
        node:18-alpine \
        sh -c "timeout 60s npm test -- --verbose --maxWorkers=1"
fi
