#!/bin/bash

# 🚀 Prepare Deployment Script
# This script prepares the app for Firebase deployment

echo "🚀 Preparing deployment..."

# Build the React app
echo "📦 Building React app..."
npm run build

# Create dist directory in public if it doesn't exist
mkdir -p public/dist

# Copy built files to public/dist
echo "📁 Copying built files to public/dist..."
cp -r dist/* public/dist/

echo "✅ Deployment preparation complete!"
echo "📁 Files are ready in public/dist/"
echo "🚀 Run 'firebase deploy' to deploy to Firebase"
