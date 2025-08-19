#!/bin/bash

# Test Results Organization Script
# This script moves all test results to the proper test-results folder structure
# Usage: npm run test:organize

set -e

echo "🧹 Organizing test results..."

# Create necessary directories if they don't exist
mkdir -p test-results/coverage
mkdir -p test-results/playwright-report
mkdir -p test-results/playwright-output
mkdir -p test-results/artifacts
mkdir -p logs

echo "📁 Created directory structure"

# Move Jest coverage results
if [ -d "coverage" ]; then
    echo "📊 Moving Jest coverage results..."
    mv coverage/* test-results/coverage/ 2>/dev/null || true
    rmdir coverage 2>/dev/null || true
    echo "✅ Jest coverage moved to test-results/coverage/"
fi

# Move Playwright reports
if [ -d "playwright-report" ]; then
    echo "🎭 Moving Playwright reports..."
    mv playwright-report/* test-results/playwright-report/ 2>/dev/null || true
    rmdir playwright-report 2>/dev/null || true
    echo "✅ Playwright reports moved to test-results/playwright-report/"
fi

# Move Playwright output (screenshots, videos, traces)
if [ -d "test-results/playwright-output" ]; then
    echo "📸 Organizing Playwright artifacts..."
    
    # Find and move screenshots
    find test-results/playwright-output -name "*.png" -type f | while read file; do
        if [[ "$file" != *"test-results/playwright-output"* ]]; then
            mv "$file" test-results/playwright-output/ 2>/dev/null || true
        fi
    done
    
    # Find and move videos
    find test-results/playwright-output -name "*.mp4" -type f | while read file; do
        if [[ "$file" != *"test-results/playwright-output"* ]]; then
            mv "$file" test-results/playwright-output/ 2>/dev/null || true
        fi
    done
    
    # Find and move traces
    find test-results/playwright-output -name "*.zip" -type f | while read file; do
        if [[ "$file" != *"test-results/playwright-output"* ]]; then
            mv "$file" test-results/playwright-output/ 2>/dev/null || true
        fi
    done
    
    echo "✅ Playwright artifacts organized"
fi

# Move any loose test result files from root
echo "🔍 Looking for loose test result files..."

# Move PNG files (screenshots)
if ls *.png 1> /dev/null 2>&1; then
    echo "📸 Moving loose PNG files..."
    mv *.png test-results/ 2>/dev/null || true
fi

# Move MP4 files (videos)
if ls *.mp4 1> /dev/null 2>&1; then
    echo "🎥 Moving loose MP4 files..."
    mv *.mp4 test-results/ 2>/dev/null || true
fi

# Move ZIP files (traces)
if ls *.zip 1> /dev/null 2>&1; then
    echo "📦 Moving loose ZIP files..."
    mv *.zip test-results/ 2>/dev/null || true
fi

# Move log files
if ls *.log 1> /dev/null 2>&1; then
    echo "📝 Moving loose log files..."
    mv *.log logs/ 2>/dev/null || true
fi

# Move any other test-related files
if ls *test* 1> /dev/null 2>&1; then
    echo "📋 Moving other test-related files..."
    for file in *test*; do
        if [ -f "$file" ] && [[ "$file" != "package.json" ]] && [[ "$file" != "package-lock.json" ]]; then
            mv "$file" test-results/ 2>/dev/null || true
        fi
    done
fi

# Move diagnostic files
if ls diagnostic* 1> /dev/null 2>&1; then
    echo "🔍 Moving diagnostic files..."
    mv diagnostic* test-results/ 2>/dev/null || true
fi

# Clean up empty directories
echo "🧹 Cleaning up empty directories..."
find . -type d -empty -delete 2>/dev/null || true

# Create summary of what was organized
echo "📋 Creating organization summary..."

cat > test-results/organization-summary.md << EOF
# Test Results Organization Summary

Generated on: $(date)

## What was organized:

### Coverage Results
- Jest coverage reports moved to: \`test-results/coverage/\`

### Playwright Results
- HTML reports moved to: \`test-results/playwright-report/\`
- Artifacts (screenshots, videos, traces) moved to: \`test-results/playwright-output/\`

### Logs
- All log files moved to: \`logs/\`

### Other Files
- Screenshots, videos, and traces moved to: \`test-results/\`
- Diagnostic files moved to: \`test-results/\`

## Directory Structure:
\`\`\`
test-results/
├── coverage/           # Jest coverage reports
├── playwright-report/  # Playwright HTML reports
├── playwright-output/  # Playwright artifacts
├── artifacts/          # Additional artifacts
└── organization-summary.md

logs/                   # All log files
\`\`\`

## Next Steps:
1. View Jest coverage: Open \`test-results/coverage/lcov-report/index.html\`
2. View Playwright report: Open \`test-results/playwright-report/index.html\`
3. Check logs: Look in \`logs/\` directory
4. Run tests again: \`npm run test:organize\`

EOF

echo "✅ Organization summary created at test-results/organization-summary.md"

# Show final directory structure
echo ""
echo "📁 Final test-results structure:"
tree test-results -I 'node_modules' 2>/dev/null || find test-results -type f | head -20

echo ""
echo "📁 Logs directory:"
ls -la logs/ 2>/dev/null || echo "No logs directory found"

echo ""
echo "🎉 Test results organization complete!"
echo "💡 Run 'npm run test:organize' anytime to reorganize results"
