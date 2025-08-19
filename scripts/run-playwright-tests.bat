@echo off
setlocal enabledelayedexpansion

REM Playwright Test Runner and File Organizer Script (Windows)
REM This script runs Playwright tests and organizes all outputs into the test-results folder

echo 🎭 Playwright Test Runner and File Organizer
echo ================================================

REM Configuration
set TEST_RESULTS_DIR=test-results
set PLAYWRIGHT_OUTPUT_DIR=%TEST_RESULTS_DIR%\playwright-output
set PLAYWRIGHT_REPORT_DIR=%TEST_RESULTS_DIR%\playwright-report
set COVERAGE_DIR=%TEST_RESULTS_DIR%\coverage
set LOGS_DIR=logs

REM Create necessary directories if they don't exist
echo 📁 Creating directory structure...
if not exist "%TEST_RESULTS_DIR%" mkdir "%TEST_RESULTS_DIR%"
if not exist "%PLAYWRIGHT_OUTPUT_DIR%" mkdir "%PLAYWRIGHT_OUTPUT_DIR%"
if not exist "%PLAYWRIGHT_REPORT_DIR%" mkdir "%PLAYWRIGHT_REPORT_DIR%"
if not exist "%COVERAGE_DIR%" mkdir "%COVERAGE_DIR%"
if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

REM Clean up any existing test artifacts in root directory
echo 🧹 Cleaning up existing test artifacts...
for %%f in (*.png) do (
    if exist "%%f" (
        move "%%f" "%TEST_RESULTS_DIR%\"
        echo Moved %%f to %TEST_RESULTS_DIR%\
    )
)
for %%f in (*.mp4) do (
    if exist "%%f" (
        move "%%f" "%TEST_RESULTS_DIR%\"
        echo Moved %%f to %TEST_RESULTS_DIR%\
    )
)
for %%f in (*.webm) do (
    if exist "%%f" (
        move "%%f" "%TEST_RESULTS_DIR%\"
        echo Moved %%f to %TEST_RESULTS_DIR%\
    )
)

REM Remove any duplicate test directories in root
echo 🗑️  Removing duplicate test directories...
if exist "coverage" (
    if not "%COVERAGE_DIR%"=="coverage" (
        rmdir /s /q "coverage"
        echo Removed duplicate coverage directory
    )
)
if exist "playwright-report" (
    if not "%PLAYWRIGHT_REPORT_DIR%"=="playwright-report" (
        rmdir /s /q "playwright-report"
        echo Removed duplicate playwright-report directory
    )
)

REM Run Playwright tests
echo 🚀 Running Playwright tests...
echo This may take a few minutes...

REM Capture the start time
set START_TIME=%TIME%

REM Run the tests and capture output
npm run test:e2e > "%LOGS_DIR%\playwright-output.log" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Playwright tests completed successfully!
    set TEST_STATUS=SUCCESS
) else (
    echo ❌ Playwright tests failed, but continuing with file organization...
    set TEST_STATUS=FAILED
)

REM Capture the end time
set END_TIME=%TIME%

echo 📊 Test execution completed

REM Organize test outputs
echo 📦 Organizing test outputs...

REM Move any new screenshots, videos, or other test artifacts to test-results
echo Moving test artifacts to %TEST_RESULTS_DIR%\...

REM Find and move all test-related files from root and subdirectories
for /r . %%f in (*.png) do (
    if not "%%~dpf"=="%TEST_RESULTS_DIR%\" (
        if not "%%~dpf"=="%CD%\node_modules\" (
            move "%%f" "%TEST_RESULTS_DIR%\"
        )
    )
)
for /r . %%f in (*.mp4) do (
    if not "%%~dpf"=="%TEST_RESULTS_DIR%\" (
        if not "%%~dpf"=="%CD%\node_modules\" (
            move "%%f" "%TEST_RESULTS_DIR%\"
        )
    )
)
for /r . %%f in (*.webm) do (
    if not "%%~dpf"=="%TEST_RESULTS_DIR%\" (
        if not "%%~dpf"=="%CD%\node_modules\" (
            move "%%f" "%TEST_RESULTS_DIR%\"
        )
    )
)

REM Move any coverage reports
if exist "coverage" (
    if not "%COVERAGE_DIR%"=="coverage" (
        echo Moving coverage reports...
        xcopy "coverage\*" "%COVERAGE_DIR%\" /E /I /Y >nul 2>&1
        rmdir /s /q "coverage"
    )
)

REM Move any Playwright reports
if exist "playwright-report" (
    if not "%PLAYWRIGHT_REPORT_DIR%"=="playwright-report" (
        echo Moving Playwright reports...
        xcopy "playwright-report\*" "%PLAYWRIGHT_REPORT_DIR%\" /E /I /Y >nul 2>&1
        rmdir /s /q "playwright-report"
    )
)

REM Generate a summary of what was organized
echo 📋 Generating organization summary...

REM Count files in test-results
set PNG_COUNT=0
set MP4_COUNT=0
set WEBM_COUNT=0

for %%f in ("%TEST_RESULTS_DIR%\*.png") do set /a PNG_COUNT+=1
for %%f in ("%TEST_RESULTS_DIR%\*.mp4") do set /a MP4_COUNT+=1
for %%f in ("%TEST_RESULTS_DIR%\*.webm") do set /a WEBM_COUNT+=1

set /a TOTAL_ARTIFACTS=PNG_COUNT+MP4_COUNT+WEBM_COUNT

REM Create a summary report
set SUMMARY_FILE=%TEST_RESULTS_DIR%\test-run-summary-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.md
set SUMMARY_FILE=%SUMMARY_FILE: =0%

echo # Test Run Summary - %date% %time% > "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Test Execution >> "%SUMMARY_FILE%"
echo - **Status**: %TEST_STATUS% >> "%SUMMARY_FILE%"
echo - **Completed**: %date% %time% >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Files Organized >> "%SUMMARY_FILE%"
echo - **PNG Screenshots**: %PNG_COUNT% >> "%SUMMARY_FILE%"
echo - **MP4 Videos**: %MP4_COUNT% >> "%SUMMARY_FILE%"
echo - **WebM Videos**: %WEBM_COUNT% >> "%SUMMARY_FILE%"
echo - **Total Artifacts**: %TOTAL_ARTIFACTS% >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Directory Structure >> "%SUMMARY_FILE%"
echo - **Test Results**: %TEST_RESULTS_DIR%\ >> "%SUMMARY_FILE%"
echo - **Playwright Output**: %PLAYWRIGHT_OUTPUT_DIR%\ >> "%SUMMARY_FILE%"
echo - **Playwright Reports**: %PLAYWRIGHT_REPORT_DIR%\ >> "%SUMMARY_FILE%"
echo - **Coverage Reports**: %COVERAGE_DIR%\ >> "%SUMMARY_FILE%"
echo - **Logs**: %LOGS_DIR%\ >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Test Logs >> "%SUMMARY_FILE%"
echo - **Playwright Output**: %LOGS_DIR%\playwright-output.log >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"
echo ## Next Steps >> "%SUMMARY_FILE%"
echo 1. View test results in: %PLAYWRIGHT_REPORT_DIR%\index.html >> "%SUMMARY_FILE%"
echo 2. Check coverage in: %COVERAGE_DIR%\lcov-report\index.html >> "%SUMMARY_FILE%"
echo 3. Review screenshots in: %TEST_RESULTS_DIR%\ >> "%SUMMARY_FILE%"

echo ✅ File organization completed!
echo 📊 Summary:
echo   - PNG files: %PNG_COUNT%
echo   - MP4 files: %MP4_COUNT%
echo   - WebM files: %WEBM_COUNT%
echo   - Total artifacts: %TOTAL_ARTIFACTS%

echo 📁 All test outputs organized in: %TEST_RESULTS_DIR%\
echo 📋 Summary report: %SUMMARY_FILE%
echo 📖 Test logs: %LOGS_DIR%\playwright-output.log

REM Final status
if "%TEST_STATUS%"=="SUCCESS" (
    echo 🎉 All done! Tests passed and files are organized.
    exit /b 0
) else (
    echo ⚠️  Tests had issues, but files are organized. Check logs for details.
    exit /b 1
)
