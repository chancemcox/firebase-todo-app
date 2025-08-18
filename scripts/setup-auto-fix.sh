#!/bin/bash

# Auto-Fix GitHub Actions Setup Script
# This script helps you set up the auto-fix workflows

set -e

echo "🚀 Setting up Auto-Fix GitHub Actions Workflows"
echo "================================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: This script must be run from a git repository root"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) not found. You'll need to set up secrets manually."
    echo "   Install it from: https://cli.github.com/"
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "1. Go to your repository on GitHub"
    echo "2. Click Settings → Secrets and variables → Actions"
    echo "3. Add the following secrets:"
    echo "   - CURSOR_API_KEY: Your Cursor API key"
    echo "   - CURSOR_WORKSPACE_ID: Your Cursor workspace ID"
    echo ""
else
    echo "✅ GitHub CLI found. Let's set up the secrets automatically."
    echo ""
    
    # Get repository info
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
    echo "📁 Repository: $REPO"
    
    # Check if secrets already exist
    if gh secret list 2>/dev/null | grep -q "CURSOR_API_KEY"; then
        echo "✅ CURSOR_API_KEY secret already exists"
    else
        echo "🔑 Setting up CURSOR_API_KEY secret..."
        echo "   Please enter your Cursor API key:"
        read -s CURSOR_API_KEY
        
        if [ -n "$CURSOR_API_KEY" ]; then
            echo "$CURSOR_API_KEY" | gh secret set CURSOR_API_KEY
            echo "✅ CURSOR_API_KEY secret set successfully"
        else
            echo "⚠️  Skipping CURSOR_API_KEY setup"
        fi
    fi
    
    if gh secret list 2>/dev/null | grep -q "CURSOR_WORKSPACE_ID"; then
        echo "✅ CURSOR_WORKSPACE_ID secret already exists"
    else
        echo "🔑 Setting up CURSOR_WORKSPACE_ID secret..."
        echo "   Please enter your Cursor workspace ID:"
        read CURSOR_WORKSPACE_ID
        
        if [ -n "$CURSOR_WORKSPACE_ID" ]; then
            echo "$CURSOR_WORKSPACE_ID" | gh secret set CURSOR_WORKSPACE_ID
            echo "✅ CURSOR_WORKSPACE_ID secret set successfully"
        else
            echo "⚠️  Skipping CURSOR_WORKSPACE_ID setup"
        fi
    fi
fi

echo ""
echo "📋 Workflow Files Created:"
echo "✅ .github/workflows/auto-fix.yml - Basic auto-fix workflow"
echo "✅ .github/workflows/cursor-auto-fix.yml - Cursor AI auto-fix workflow"
echo "✅ docs/AUTO_FIX_SETUP.md - Complete setup documentation"

echo ""
echo "🔧 Next Steps:"
echo "1. Push these changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add auto-fix GitHub Actions workflows'"
echo "   git push"
echo ""
echo "2. Check the Actions tab in your GitHub repository"
echo "3. The workflows will run automatically on the next push"
echo "4. You can also trigger them manually from the Actions tab"
echo ""
echo "📚 For more information, see: docs/AUTO_FIX_SETUP.md"
echo ""
echo "🎉 Setup complete! Your repository now has automatic issue detection and fixing."
