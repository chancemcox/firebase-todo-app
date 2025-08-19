# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing, building, and deployment of the Firebase Todo App.

## Available Workflows

### **🎭 Playwright E2E Tests** (`playwright-tests.yml`)
Runs Playwright end-to-end tests across all browsers and organizes results.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Features:**
- Tests across Chromium, Firefox, and WebKit browsers
- Automatic artifact uploads to `test-results/` folder
- Screenshot capture and storage
- Test report generation

### **🧪 Full Test Suite** (`full-test-suite.yml`)
Comprehensive testing workflow that runs both unit tests and E2E tests.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Features:**
- **Unit Tests**: Jest tests across Node.js 18.x and 20.x
- **E2E Tests**: Playwright tests across all browsers
- **Test Organization**: Automatic organization of all results into `test-results/` folder
- **Security Audit**: Dependency security checks
- **Comprehensive Reporting**: Detailed test summaries and artifacts

### **📁 Archived Workflows** (`archive/`)
Contains previous workflow versions and experimental configurations.

## Test Results Organization

All GitHub Actions workflows automatically organize test outputs into the `test-results/` folder structure:

```
test-results/
├── coverage/                    # Jest unit test coverage reports
├── playwright-output/           # Playwright test artifacts
├── playwright-report/           # Playwright HTML reports
├── logs/                        # Test execution logs
├── *.png                        # Test screenshots
├── *.mp4                        # Test videos (if enabled)
├── *.webm                       # Test videos (if enabled)
├── github-actions-summary.md    # Workflow execution summary
└── README.md                    # Test results documentation
```

## Artifact Management

### **Automatic Uploads**
- **Unit Test Results**: Coverage reports and logs
- **E2E Test Results**: Screenshots, videos, and test artifacts
- **Test Reports**: HTML reports and summaries
- **Security Reports**: Audit results and dependency checks

### **Retention Policy**
- **Test Artifacts**: 30 days
- **Reports**: 30 days
- **Logs**: 30 days

## Integration with Local Development

### **Consistent Structure**
The GitHub Actions workflows maintain the same folder structure as your local development environment:
- `test-results/` - All test outputs
- `logs/` - Test execution logs
- `coverage/` - Test coverage reports

### **Local Scripts**
Your local scripts (`scripts/run-playwright-tests.sh` and `.bat`) work seamlessly with the GitHub Actions results.

## Workflow Execution

### **Manual Triggering**
```bash
# Trigger workflows manually through GitHub UI
# Or use GitHub CLI
gh workflow run "Full Test Suite"
gh workflow run "Playwright E2E Tests"
```

### **Branch Protection**
Workflows automatically run on:
- **Push**: Any commit to `main` or `develop`
- **Pull Request**: Any PR targeting `main` or `develop`

## Monitoring and Debugging

### **Workflow Status**
- Check workflow status in GitHub Actions tab
- Review logs for any failures
- Download artifacts for detailed analysis

### **Test Results**
- View test summaries in generated markdown files
- Check coverage reports in `test-results/coverage/`
- Review E2E test results in `test-results/playwright-report/`

## Configuration

### **Environment Variables**
- `CI=true` - Enables CI mode for tests
- `NODE_VERSION` - Node.js version for testing
- `BROWSER` - Target browser for E2E tests

### **Dependencies**
- Node.js 18.x and 20.x
- Playwright browsers (Chromium, Firefox, WebKit)
- All npm dependencies from package.json

## Benefits

- **🎯 Centralized**: All test results organized in one location
- **🔄 Automated**: No manual file organization required
- **📊 Comprehensive**: Full test coverage across environments
- **🔍 Debuggable**: Detailed logs and artifacts for troubleshooting
- **📱 Cross-platform**: Consistent results across different environments
- **📈 Scalable**: Easy to add new test types and configurations
