# Auto-Fix GitHub Actions Setup

This document explains how to set up automatic issue detection, troubleshooting, and fixing using GitHub Actions workflows.

## Overview

We've created two GitHub Actions workflows that automatically detect and fix issues in your codebase:

1. **Auto-Fix and Troubleshoot** (`auto-fix.yml`) - Basic automatic fixing
2. **Cursor AI Auto-Fix** (`cursor-auto-fix.yml`) - Advanced AI-powered fixing

## Workflow 1: Auto-Fix and Troubleshoot

### What it does:
- Runs on every push to `main` and `develop` branches
- Automatically fixes linting issues
- Generates missing test files
- Resolves common build problems
- Commits and pushes fixes automatically
- Creates GitHub issues for manual review

### Setup:
No additional setup required - this workflow works out of the box.

### Features:
- ✅ Auto-fix ESLint issues
- ✅ Generate missing test files
- ✅ Fix common build problems
- ✅ Automatic commit and push
- ✅ GitHub issue creation for review

## Workflow 2: Cursor AI Auto-Fix

### What it does:
- Integrates with Cursor's AI capabilities
- Comprehensive diagnostic analysis
- Intelligent issue resolution
- Advanced test generation
- Detailed reporting and tracking

### Setup Required:

#### 1. Add GitHub Secrets
Go to your repository → Settings → Secrets and variables → Actions, and add:

```
CURSOR_API_KEY=your_cursor_api_key_here
CURSOR_WORKSPACE_ID=your_cursor_workspace_id_here
```

#### 2. Get Cursor API Key
1. Open Cursor
2. Go to Settings → Extensions → Cursor AI
3. Copy your API key

#### 3. Get Workspace ID
1. In Cursor, open your project
2. Check the workspace URL or settings for the workspace ID
3. Or use the Cursor CLI: `cursor workspace list`

### Features:
- ✅ AI-powered issue analysis
- ✅ Intelligent fix generation
- ✅ Comprehensive diagnostics
- ✅ Advanced test generation
- ✅ Detailed reporting
- ✅ Integration with Cursor AI

## How It Works

### Trigger:
- **Automatic**: Every push to `main` or `develop`
- **Manual**: Use "Run workflow" button in GitHub Actions tab
- **Pull Requests**: Runs on PR creation and updates

### Process:
1. **Diagnostics**: Runs tests, linting, and build checks
2. **Issue Detection**: Identifies problems and categorizes them
3. **Auto-Fix**: Applies fixes automatically where possible
4. **Verification**: Runs tests again to ensure fixes work
5. **Commit**: Automatically commits and pushes fixes
6. **Reporting**: Creates GitHub issues for manual review

## What Gets Fixed Automatically

### Linting Issues:
- ESLint errors and warnings
- Code style violations
- Import/export problems

### Test Issues:
- Missing test files
- Test setup problems
- Basic test structure

### Build Issues:
- Missing dependencies
- Configuration problems
- Basic build errors

### Coverage Issues:
- Missing test files for components
- Low coverage areas identification

## Manual Review Required

The workflows create GitHub issues for:
- Reviewing auto-generated tests
- Verifying fixes are appropriate
- Ensuring test coverage meets thresholds
- Testing functionality locally

## Customization

### Modify Triggers:
Edit the `on:` section in each workflow file:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]  # Add more branches
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
```

### Add More Fixes:
Extend the auto-fix steps in the workflow files:

```yaml
- name: Custom Auto-Fix
  run: |
    # Add your custom fix logic here
    echo "Applying custom fixes..."
```

### Modify Test Generation:
Update the test template in the workflow files to match your testing patterns.

## Troubleshooting

### Workflow Not Running:
1. Check branch names in the `on:` section
2. Verify GitHub Actions are enabled for the repository
3. Check for syntax errors in the workflow files

### Fixes Not Applied:
1. Check the workflow logs for errors
2. Verify the workflow has write permissions
3. Check if the `GITHUB_TOKEN` has sufficient permissions

### Cursor AI Not Working:
1. Verify API key and workspace ID are correct
2. Check Cursor API rate limits
3. Ensure the API key has access to the workspace

## Best Practices

1. **Review Auto-Fixes**: Always review automatically generated code
2. **Test Locally**: Run tests locally after auto-fixes
3. **Monitor Coverage**: Keep track of test coverage improvements
4. **Update Workflows**: Regularly update the workflows as your project evolves
5. **Backup**: Keep backups of important files before major auto-fixes

## Security Considerations

- The workflows run with `GITHUB_TOKEN` permissions
- Auto-commits are signed with the GitHub Action bot
- All changes are tracked and can be reviewed
- Sensitive information should not be included in auto-fixes

## Support

If you encounter issues:
1. Check the workflow logs in GitHub Actions
2. Review the generated GitHub issues
3. Check the documentation for common problems
4. Create a new issue for workflow-specific problems

---

*Last updated: December 2024*
*Modified by Chance - Auto-fix workflow setup documentation*
