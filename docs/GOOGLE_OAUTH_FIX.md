# Google OAuth Fix Guide

## 🚨 **Error: redirect_uri_mismatch**

This error occurs when the redirect URI in your Google Cloud Console doesn't match what your app is sending.

## 🔧 **Step-by-Step Fix**

### **1. Access Google Cloud Console**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project: `todo-list-e7788`
- Navigate to **APIs & Services** > **Credentials**

### **2. Find Your OAuth 2.0 Client ID**
- Look for "OAuth 2.0 Client IDs" in the credentials list
- Click on the one associated with your Firebase project

### **3. Add Authorized Redirect URIs**
Add these URLs to the "Authorized redirect URIs" section:

```
https://todo.cox-fam.com/__/auth/handler
https://todo-list-e7788.web.app/__/auth/handler
https://todo-cox-fam.com/__/auth/handler
http://localhost:3000/__/auth/handler
```

### **4. Add Authorized JavaScript Origins**
Add these URLs to the "Authorized JavaScript origins" section:

```
https://todo.cox-fam.com
https://todo-list-e7788.web.app
https://todo-cox-fam.com
http://localhost:3000
```

### **5. Save Changes**
- Click "Save" to apply the changes
- Wait a few minutes for changes to propagate

## 🌐 **Domain Configuration**

### **Current Firebase Domains**
- **Primary**: `todo.cox-fam.com` (custom domain)
- **Fallback**: `todo-list-e7788.web.app` (Firebase hosting)
- **Local**: `localhost:3000` (development)

### **Firebase Project Settings**
- **Project ID**: `todo-list-e7788`
- **Auth Domain**: `todo.cox-fam.com`

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Wrong Project**: Make sure you're editing the correct Google Cloud project
2. **Caching**: Changes may take 5-10 minutes to take effect
3. **Domain Mismatch**: Ensure all your domains are listed in both sections
4. **Protocol Mismatch**: Use `https://` for production, `http://` for localhost

### **Verification Steps**
1. **Check Console**: Look for domain-related errors in browser console
2. **Test Local**: Try signing in from `localhost:3000` first
3. **Test Production**: Then test from your custom domain
4. **Clear Cache**: Clear browser cache and cookies if needed

## 📱 **Updated Code**

The Firebase configuration has been updated with:
- Better error handling for OAuth issues
- Automatic fallback from popup to redirect
- Domain-specific login hints
- Comprehensive logging for debugging

## 🚀 **Testing**

### **Local Development**
```bash
npm run dev
# Test Google sign-in at http://localhost:3000
```

### **Production**
```bash
npm run build
npm run deploy
# Test Google sign-in at https://todo.cox-fam.com
```

## 📞 **Support**

If the issue persists:
1. Check Google Cloud Console logs
2. Verify Firebase project settings
3. Check browser console for specific error messages
4. Ensure all domains are properly configured

## 🔒 **Security Notes**

- **HTTPS Required**: Production domains must use HTTPS
- **Domain Restriction**: Consider restricting to specific domains
- **Scope Limitation**: Only request necessary OAuth scopes
- **Regular Review**: Periodically review authorized domains
