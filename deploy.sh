#!/bin/bash

echo "🚀 Deploying Firebase Todo App..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase
echo "🔐 Logging into Firebase..."
firebase login

# Deploy using Serverless Framework
echo "📦 Deploying with Serverless Framework..."
npx serverless deploy

# Deploy Firebase hosting and functions
echo "🌐 Deploying Firebase hosting and functions..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌍 Your app should be available at: https://todo.chancecox.com"
echo "📱 Firebase Console: https://console.firebase.google.com/project/todo-list-e7788"
