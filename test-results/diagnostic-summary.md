# Code Diagnostic Summary

## Test Results
$(cat test-output.log)

## Linting Results
$(cat lint-output.log)

## Build Results
$(cat build-output.log)

## Coverage Results
$(cat coverage-output.log)

## Files Changed
$(git diff --name-only HEAD~1 || echo "No changes detected")

## Issues Summary
- Test failures: $(grep -c "FAIL\|Error\|failed" test-output.log || echo "0")
- Linting errors: $(grep -c "error\|Error" lint-output.log || echo "0")
- Build issues: $(grep -c "error\|Error\|failed" build-output.log || echo "0")
