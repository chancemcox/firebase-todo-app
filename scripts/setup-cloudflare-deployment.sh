#!/bin/bash

# 🚀 Cloudflare Pages Deployment Setup Script
# This script helps you set up deployment to Cloudflare Pages

echo "🚀 Setting up Cloudflare Pages Deployment"
echo "========================================"

# Check if wrangler is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm first."
    exit 1
fi

# Check if the build directory exists
if [ ! -d "./dist" ]; then
    echo "❌ Build directory not found. Building the application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix build errors and try again."
        exit 1
    fi
else
    echo "✅ Build directory found"
fi

# Check if CLOUDFLARE_API_TOKEN is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN environment variable not set"
    echo ""
    echo "🔧 To set up the API token:"
    echo "1. Go to https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use 'Custom token' template"
    echo "4. Set permissions: Cloudflare Pages:Edit"
    echo "5. Copy the token and set it:"
    echo "   export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
    echo "📚 See CLOUDFLARE_DEPLOYMENT.md for detailed instructions"
    exit 1
else
    echo "✅ CLOUDFLARE_API_TOKEN is set"
fi

# Test wrangler authentication
echo "🔐 Testing Cloudflare authentication..."
npx wrangler whoami
if [ $? -ne 0 ]; then
    echo "❌ Authentication failed. Please check your API token."
    exit 1
fi

echo "✅ Authentication successful"

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy ./dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎯 Your application is now live on Cloudflare Pages!"
    echo "📚 Check the Cloudflare Pages dashboard for your deployment URL"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi