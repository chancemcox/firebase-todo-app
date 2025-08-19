# Test Results Organization Summary

Generated on: Tue Aug 19 11:28:21 CDT 2025

## What was organized:

### Coverage Results
- Jest coverage reports moved to: `test-results/coverage/`

### Playwright Results
- HTML reports moved to: `test-results/playwright-report/`
- Artifacts (screenshots, videos, traces) moved to: `test-results/playwright-output/`

### Logs
- All log files moved to: `logs/`

### Other Files
- Screenshots, videos, and traces moved to: `test-results/`
- Diagnostic files moved to: `test-results/`

## Directory Structure:
```
test-results/
├── coverage/           # Jest coverage reports
├── playwright-report/  # Playwright HTML reports
├── playwright-output/  # Playwright artifacts
├── artifacts/          # Additional artifacts
└── organization-summary.md

logs/                   # All log files
```

## Next Steps:
1. View Jest coverage: Open `test-results/coverage/lcov-report/index.html`
2. View Playwright report: Open `test-results/playwright-report/index.html`
3. Check logs: Look in `logs/` directory
4. Run tests again: `npm run test:organize`

