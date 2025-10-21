# 🚀 Cloudflare Pages Deployment Guide

This guide will help you deploy your React application to Cloudflare Pages using Wrangler.

## 📋 Prerequisites

1. **Cloudflare Account** - Sign up at [cloudflare.com](https://cloudflare.com)
2. **Cloudflare API Token** - Required for deployment
3. **Built Application** - The `dist` directory with your built React app

## 🔧 Setup Steps

### 1. Create Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Use **"Custom token"** template
4. Configure the token with these permissions:
   - **Account**: `Cloudflare Pages:Edit`
   - **Zone Resources**: `Include All zones` (or specific zone)
5. Click **"Continue to summary"** and **"Create Token"**
6. **Copy the token** - you'll need it for deployment

### 2. Set Environment Variable

Set the `CLOUDFLARE_API_TOKEN` environment variable:

```bash
# For local development
export CLOUDFLARE_API_TOKEN="your-token-here"

# For CI/CD environments
# Add CLOUDFLARE_API_TOKEN to your environment variables
```

### 3. Deploy to Cloudflare Pages

```bash
# Deploy the built application
npx wrangler pages deploy ./dist

# Or use the configuration file
npx wrangler pages deploy
```

## 🔄 Deployment Process

### Automatic Deployment
1. **Build**: `npm run build` creates the `dist` directory
2. **Deploy**: `npx wrangler pages deploy ./dist` uploads to Cloudflare Pages
3. **Access**: Your app will be available at a Cloudflare Pages URL

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy ./dist
```

## 📁 Configuration

The `wrangler.jsonc` file is configured for Cloudflare Pages:

```json
{
  "name": "firebase-todo-app",
  "compatibility_date": "2025-10-21",
  "pages_build_output_dir": "./dist"
}
```

## 🚨 Troubleshooting

### Common Issues

**"Missing CLOUDFLARE_API_TOKEN"**
- Ensure the API token is set in your environment
- Verify the token has the correct permissions
- Check that the token is not expired

**"Build failed"**
- Ensure the build works locally: `npm run build`
- Check that the `dist` directory exists
- Verify all dependencies are installed

**"Deployment failed"**
- Check your Cloudflare account permissions
- Verify the API token is valid
- Ensure you have Pages access in your Cloudflare plan

### Debugging Steps

1. **Test locally**: `npm run build && npx wrangler pages deploy ./dist`
2. **Check token**: `npx wrangler whoami` (if authenticated)
3. **Verify build**: Ensure `dist` directory contains your built files
4. **Check logs**: Review Wrangler logs for specific error messages

## 🔒 Security Notes

- **Never commit** API tokens to version control
- **Use environment variables** for sensitive data
- **Rotate tokens** periodically for security
- **Use least privilege** - only grant necessary permissions

## 📚 Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain**: Configure a custom domain in Cloudflare Pages
2. **Environment Variables**: Set up environment variables for your app
3. **CI/CD**: Integrate with GitHub Actions for automatic deployment
4. **Monitoring**: Set up analytics and monitoring
5. **Performance**: Optimize your app for Cloudflare's global network

---

**Happy Deploying! 🚀**

For support, check the Cloudflare Pages dashboard or Wrangler logs.