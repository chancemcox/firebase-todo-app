# Scripts Directory

This directory contains utility scripts for automating common development and testing tasks.

## Available Scripts

### **Playwright Test Organizer**

#### **Unix/Linux/macOS** (`run-playwright-tests.sh`)
```bash
# Make executable (first time only)
chmod +x scripts/run-playwright-tests.sh

# Run the script
./scripts/run-playwright-tests.sh

# Or use npm script
npm run test:organize
```

#### **Windows** (`run-playwright-tests.bat`)
```cmd
# Run the script
scripts\run-playwright-tests.bat

# Or use npm script
npm run test:organize:win
```

### **What the Playwright Organizer Does:**

1. **🧹 Cleanup**: Removes any existing test artifacts from root directory
2. **📁 Setup**: Creates necessary directory structure in `test-results/`
3. **🚀 Testing**: Runs all Playwright E2E tests
4. **📦 Organization**: Moves all test outputs to appropriate folders:
   - Screenshots → `test-results/`
   - Videos → `test-results/`
   - Reports → `test-results/playwright-report/`
   - Coverage → `test-results/coverage/`
   - Logs → `logs/`
5. **📋 Summary**: Generates a comprehensive report of what was organized
6. **🎯 Results**: All test outputs are centralized in `test-results/`

### **Other Scripts**

- **`setup-deployment.sh`** - Sets up Firebase deployment configuration
- **`prepare-deploy.sh`** - Prepares the project for deployment
- **`setup-auto-fix.sh`** - Sets up automatic code fixing

## Usage Examples

### **Run Tests and Organize Outputs**
```bash
# Unix/Linux/macOS
npm run test:organize

# Windows
npm run test:organize:win
```

### **Manual Script Execution**
```bash
# Unix/Linux/macOS
./scripts/run-playwright-tests.sh

# Windows
scripts\run-playwright-tests.bat
```

## Output Structure

After running the organizer script, your `test-results/` folder will contain:

```
test-results/
├── README.md
├── test-run-summary-YYYYMMDD-HHMMSS.md  # Generated summary
├── *.png                                 # Test screenshots
├── *.mp4                                 # Test videos (if enabled)
├── *.webm                                # Test videos (if enabled)
├── playwright-output/                    # Test artifacts
├── playwright-report/                    # HTML reports
├── coverage/                             # Coverage reports
└── diagnostic-summary.md
```

## Benefits

- **🎯 Centralized**: All test outputs in one location
- **🧹 Clean**: No test files cluttering the root directory
- **📊 Organized**: Logical folder structure for different output types
- **📋 Documented**: Automatic summary reports for each test run
- **🔄 Automated**: No manual file moving required
- **📱 Cross-platform**: Works on Unix/Linux/macOS and Windows

## Requirements

- **Node.js**: For running npm scripts
- **Playwright**: For E2E testing
- **Bash** (Unix/Linux/macOS) or **Command Prompt** (Windows)
- **Git**: For version control integration
