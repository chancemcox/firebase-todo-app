@echo off
REM Test Results Organization Script for Windows
REM This script moves all test results to the proper test-results folder structure
REM Usage: npm run test:organize:win

echo 🧹 Organizing test results...

REM Create necessary directories if they don't exist
if not exist "test-results\coverage" mkdir "test-results\coverage"
if not exist "test-results\playwright-report" mkdir "test-results\playwright-report"
if not exist "test-results\playwright-output" mkdir "test-results\playwright-output"
if not exist "test-results\artifacts" mkdir "test-results\artifacts"
if not exist "logs" mkdir "logs"

echo 📁 Created directory structure

REM Move Jest coverage results
if exist "coverage" (
    echo 📊 Moving Jest coverage results...
    xcopy "coverage\*" "test-results\coverage\" /E /Y >nul 2>&1
    rmdir /s /q "coverage" >nul 2>&1
    echo ✅ Jest coverage moved to test-results\coverage\
)

REM Move Playwright reports
if exist "playwright-report" (
    echo 🎭 Moving Playwright reports...
    xcopy "playwright-report\*" "test-results\playwright-report\" /E /Y >nul 2>&1
    rmdir /s /q "playwright-report" >nul 2>&1
    echo ✅ Playwright reports moved to test-results\playwright-report\
)

REM Move loose test result files from root
echo 🔍 Looking for loose test result files...

REM Move PNG files (screenshots)
if exist "*.png" (
    echo 📸 Moving loose PNG files...
    move "*.png" "test-results\" >nul 2>&1
)

REM Move MP4 files (videos)
if exist "*.mp4" (
    echo 🎥 Moving loose MP4 files...
    move "*.mp4" "test-results\" >nul 2>&1
)

REM Move ZIP files (traces)
if exist "*.zip" (
    echo 📦 Moving loose ZIP files...
    move "*.zip" "test-results\" >nul 2>&1
)

REM Move log files
if exist "*.log" (
    echo 📝 Moving loose log files...
    move "*.log" "logs\" >nul 2>&1
)

REM Move diagnostic files
if exist "diagnostic*" (
    echo 🔍 Moving diagnostic files...
    move "diagnostic*" "test-results\" >nul 2>&1
)

REM Create summary of what was organized
echo 📋 Creating organization summary...

(
echo # Test Results Organization Summary
echo.
echo Generated on: %date% %time%
echo.
echo ## What was organized:
echo.
echo ### Coverage Results
echo - Jest coverage reports moved to: `test-results\coverage\`
echo.
echo ### Playwright Results
echo - HTML reports moved to: `test-results\playwright-report\`
echo - Artifacts ^(screenshots, videos, traces^) moved to: `test-results\playwright-output\`
echo.
echo ### Logs
echo - All log files moved to: `logs\`
echo.
echo ### Other Files
echo - Screenshots, videos, and traces moved to: `test-results\`
echo - Diagnostic files moved to: `test-results\`
echo.
echo ## Directory Structure:
echo ```
echo test-results/
echo ├── coverage/           # Jest coverage reports
echo ├── playwright-report/  # Playwright HTML reports
echo ├── playwright-output/  # Playwright artifacts
echo ├── artifacts/          # Additional artifacts
echo └── organization-summary.md
echo.
echo logs/                   # All log files
echo ```
echo.
echo ## Next Steps:
echo 1. View Jest coverage: Open `test-results\coverage\lcov-report\index.html`
echo 2. View Playwright report: Open `test-results\playwright-report\index.html`
echo 3. Check logs: Look in `logs\` directory
echo 4. Run tests again: `npm run test:organize:win`
) > "test-results\organization-summary.md"

echo ✅ Organization summary created at test-results\organization-summary.md

REM Show final directory structure
echo.
echo 📁 Final test-results structure:
dir "test-results" /b 2>nul

echo.
echo 📁 Logs directory:
dir "logs" /b 2>nul

echo.
echo 🎉 Test results organization complete!
echo 💡 Run 'npm run test:organize:win' anytime to reorganize results
