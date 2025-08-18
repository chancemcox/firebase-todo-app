# 🚀 Automatic Deployment Guide

This guide will help you set up automatic deployment to Firebase when you push to the main branch.

## 📋 Prerequisites

1. **Firebase CLI** installed and configured
2. **Firebase project** already set up
3. **GitHub repository** with proper permissions

## 🔧 Setup Steps

### 1. Generate Firebase Service Account Key

First, you need to generate a Firebase service account key:

```bash
# Install Firebase CLI globally if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Go to your project directory
cd your-project-directory

# Generate a service account key
firebase projects:list
firebase projects:list --token your-token
firebase projects:list --project todo-list-e7788
```

### 2. Create Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`todo-list-e7788`)
3. Go to **Project Settings** (gear icon)
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file
7. **Keep this file secure** - it contains sensitive credentials

### 3. Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Add the following secrets:

#### Required Secrets:

**`FIREBASE_SERVICE_ACCOUNT`**
- Copy the entire content of the downloaded JSON file
- Paste it as the value for this secret

**`GITHUB_TOKEN`** (usually auto-provided)
- This is automatically provided by GitHub Actions

### 4. Configure Firebase Project

Make sure your `firebase.json` is properly configured:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 5. Test the Setup

1. Make a small change to your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "test: Test automatic deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub to monitor the deployment
4. Check Firebase Console to see if the deployment succeeded

## 🔄 How It Works

### Automatic Triggers
- **Push to main**: Automatically deploys when code is pushed to main branch
- **Manual deployment**: Use "workflow_dispatch" to manually trigger deployment

### Deployment Process
1. **Checkout code** from main branch
2. **Setup Node.js** environment
3. **Install dependencies** with `npm ci`
4. **Run tests** to ensure code quality
5. **Build application** with `npm run build`
6. **Deploy to Firebase** using the service account

### What Gets Deployed
- **Frontend**: React app built from `dist/` directory
- **Configuration**: Firebase hosting rules and redirects
- **Assets**: All static files (CSS, JS, images)

## 🚨 Troubleshooting

### Common Issues

**"Firebase service account not found"**
- Ensure the `FIREBASE_SERVICE_ACCOUNT` secret is properly set
- Check that the JSON content is complete and valid

**"Build failed"**
- Check that all tests pass locally: `npm test`
- Ensure the build works locally: `npm run build`
- Check for any dependency issues

**"Deployment failed"**
- Verify your Firebase project ID is correct
- Ensure you have proper permissions on the Firebase project
- Check Firebase Console for any quota or billing issues

### Debugging Steps

1. **Check GitHub Actions logs** for detailed error messages
2. **Test locally** first: `npm test && npm run build`
3. **Verify Firebase CLI** works: `firebase projects:list`
4. **Check Firebase Console** for deployment status

## 🔒 Security Notes

- **Never commit** the service account JSON file
- **Rotate keys** periodically for security
- **Use least privilege** - only grant necessary permissions
- **Monitor deployments** for any suspicious activity

## 📚 Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## 🎯 Next Steps

After setting up automatic deployment:

1. **Test the pipeline** with a small change
2. **Monitor deployments** in GitHub Actions
3. **Set up notifications** for deployment status
4. **Configure custom domains** if needed
5. **Set up staging environments** for testing

---

**Happy Deploying! 🚀**

For support, check the GitHub Actions logs or open an issue in the repository.
