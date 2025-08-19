# Test Results Directory

This directory contains all test outputs, reports, and diagnostic information for the Firebase Todo App.

## Files

### Test Outputs
- **test-output.log** - Jest unit test execution output and results
- **lint-output.log** - ESLint code quality check results
- **coverage-output.log** - Code coverage report output
- **build-output.log** - Vite build process output and warnings

### Coverage Reports
- **coverage/** - Jest code coverage HTML reports and data

### Playwright E2E Test Reports
- **playwright-report/** - End-to-end test execution reports and screenshots

### Test Screenshots
- **custom-domain-google-login-test.png** - Screenshot from Google login test on custom domain
- **production-google-login-test.png** - Screenshot from Google login test on production domain
- **simple-page-load-test.png** - Screenshot from basic page load test

### Diagnostic Information
- **diagnostic-summary.md** - Summary of diagnostic findings and issues
- **.last-run.json** - Metadata about the last test run

## Running Tests

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

## Coverage

Code coverage reports are generated in HTML format and can be viewed by opening `coverage/index.html` in a web browser.

## E2E Test Reports

Playwright generates detailed HTML reports with screenshots, videos, and traces. Open `playwright-report/index.html` to view the full report.
