# Scripts Directory

This directory contains utility scripts for testing, deployment, and project management.

## 🧪 Test Scripts

### `organize-test-results.sh` / `organize-test-results.bat`
**Purpose**: Organizes all test results into the proper folder structure
**Usage**: 
- macOS/Linux: `npm run test:organize`
- Windows: `npm run test:organize:win`

**What it does**:
- Moves Jest coverage reports to `test-results/coverage/`
- Moves Playwright reports to `test-results/playwright-report/`
- Moves Playwright artifacts (screenshots, videos, traces) to `test-results/playwright-output/`
- Moves all log files to `logs/`
- Moves loose test files from root to `test-results/`
- Creates an organization summary
- Cleans up empty directories

### `run-tests-and-organize.sh`
**Purpose**: Runs all tests with timeouts and then organizes results
**Usage**: `npm run test:run:all`

**What it does**:
- Runs Jest unit tests with coverage (5 min timeout)
- Runs Playwright E2E tests (10 min timeout)
- Runs ESLint (2 min timeout)
- Organizes all test results automatically
- Provides comprehensive test summary
- Shows any failures or issues

## 🚀 Deployment Scripts

### `setup-deployment.sh`
**Purpose**: Sets up deployment configuration
**Usage**: `npm run deploy:setup`

### `prepare-deploy.sh`
**Purpose**: Prepares the project for deployment
**Usage**: `npm run prepare-deploy`

## 📋 Available NPM Scripts

### Test Scripts
```bash
npm run test                    # Run Jest unit tests
npm run test:watch             # Run Jest in watch mode
npm run test:coverage          # Run Jest with coverage
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Run Playwright with UI
npm run test:e2e:headed        # Run Playwright in headed mode
npm run test:e2e:debug         # Run Playwright in debug mode
npm run test:organize          # Organize test results (macOS/Linux)
npm run test:organize:win      # Organize test results (Windows)
npm run test:organize:all      # Run tests then organize
npm run test:run:all           # Run all tests with timeouts and organize
```

### Code Quality
```bash
npm run lint                    # Run ESLint
npm run lint:fix               # Run ESLint with auto-fix
```

### Build & Deploy
```bash
npm run build                  # Build the project
npm run deploy                 # Build and deploy to Firebase
npm run deploy:setup           # Setup deployment configuration
npm run prepare-deploy         # Prepare for deployment
```

## 🎯 Quick Start

### Run All Tests and Organize Results
```bash
npm run test:run:all
```

### Just Organize Existing Results
```bash
npm run test:organize          # macOS/Linux
npm run test:organize:win      # Windows
```

### Run Specific Test Types
```bash
npm run test:coverage          # Unit tests with coverage
npm run test:e2e               # E2E tests
npm run lint                   # Code quality check
```

## 📁 Output Structure

After running tests and organizing results:

```
test-results/
├── coverage/                  # Jest coverage reports
│   └── lcov-report/
│       └── index.html        # Coverage HTML report
├── playwright-report/         # Playwright HTML reports
│   └── index.html            # E2E test report
├── playwright-output/         # Playwright artifacts
│   ├── screenshots/          # Test screenshots
│   ├── videos/               # Test videos
│   └── traces/               # Test traces
├── artifacts/                 # Additional artifacts
└── organization-summary.md    # What was organized

logs/                          # All test logs
├── test-output.log           # Jest output
├── coverage-output.log       # Coverage output
├── playwright-output.log     # Playwright output
└── lint-output.log           # ESLint output
```

## 🔧 Troubleshooting

### Script Permission Issues
If you get permission errors on macOS/Linux:
```bash
chmod +x scripts/*.sh
```

### Timeout Issues
The scripts include timeouts to prevent hanging:
- Jest: 5 minutes
- Playwright: 10 minutes
- ESLint: 2 minutes

### Cross-Platform Compatibility
- `.sh` files for macOS/Linux
- `.bat` files for Windows
- Both provide the same functionality

## 📝 Customization

You can modify the timeout values in `run-tests-and-organize.sh`:
```bash
run_test_with_timeout "Jest Unit Tests" "npm run test:coverage" 300  # 5 minutes
run_test_with_timeout "Playwright E2E Tests" "npm run test:e2e" 600  # 10 minutes
run_test_with_timeout "ESLint" "npm run lint" 120                    # 2 minutes
```

## 🚀 Integration with CI/CD

These scripts are designed to work with:
- GitHub Actions
- Local development
- CI/CD pipelines
- Docker environments

The scripts create consistent output structures regardless of the environment they run in.
