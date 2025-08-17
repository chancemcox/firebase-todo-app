#!/bin/bash

# 🚀 Firebase Deployment Setup Script
# This script helps you set up automatic deployment to Firebase

echo "🚀 Setting up Firebase Automatic Deployment"
echo "=========================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI is already installed"
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase..."
    firebase login
else
    echo "✅ Already logged in to Firebase"
fi

# List available projects
echo ""
echo "📋 Available Firebase projects:"
firebase projects:list

echo ""
echo "🔧 Next steps:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/"
echo "2. Select your project (todo-list-e7788)"
echo "3. Go to Project Settings → Service Accounts"
echo "4. Click 'Generate new private key'"
echo "5. Download the JSON file"
echo "6. Go to GitHub → Settings → Secrets → Actions"
echo "7. Add secret: FIREBASE_SERVICE_ACCOUNT"
echo "8. Paste the entire JSON content as the value"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🎯 After setup, push to main branch to trigger deployment!"
