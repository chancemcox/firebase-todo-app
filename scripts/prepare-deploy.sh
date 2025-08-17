#!/bin/bash

# 🚀 Prepare Deployment Script
# This script prepares the app for Firebase deployment

echo "🚀 Preparing deployment..."

# Build the React app
echo "📦 Building React app..."
npm run build

# Create dist directory in public if it doesn't exist
mkdir -p public/dist

# Clean previous deployment files
echo "🧹 Cleaning previous deployment files..."
rm -rf public/dist/*

# Copy built files to public/dist
echo "📁 Copying built files to public/dist..."
cp -r dist/* public/dist/

# Ensure the landing page is preserved
echo "📄 Preserving landing page..."
cp public/index.html public/dist/landing.html

echo "✅ Deployment preparation complete!"
echo "📁 Files are ready in public/dist/"
echo "🚀 Run 'firebase deploy' to deploy to Firebase"
echo ""
echo "📋 Deployment structure:"
echo "   / (root) → Landing page"
echo "   /app/** → React todo application"
