# Deployment Guide for Firebase Todo App

## Overview
This Laravel application has been successfully built and tested with a Firebase backend. All 15 API tests are passing, confirming the core functionality is working correctly.

## Architecture
- **Frontend**: Firebase Hosting (serves static files and redirects API calls)
- **Backend**: Laravel PHP application (runs on your web server)
- **Database**: Firebase Realtime Database
- **Authentication**: Laravel Passport with Firebase OAuth storage

## Current Status
✅ **API Development Complete** - All REST API endpoints working with Firebase  
✅ **OAuth2 Authentication** - Laravel Passport integration with Firebase storage  
✅ **Comprehensive Testing** - All API tests passing  
✅ **API Documentation** - Swagger/OpenAPI docs available at `/apidoc`  
✅ **Firebase Integration** - Complete Firebase backend setup  

## Deployment Options

### Option 1: Firebase Hosting + Laravel PHP Backend (Recommended)

#### Frontend (Firebase Hosting)
1. **Deploy Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```
   This will serve the static frontend and redirect API calls to your Laravel backend.

#### Backend (Laravel PHP on Web Server)
1. **Deploy Laravel to your web server** at `https://todo.cox-fam.com/`
2. **Configure environment variables**:
   ```env
   APP_URL=https://todo.cox-fam.com
   FIREBASE_PROJECT_ID=todo-list-e7788
   FIREBASE_DATABASE_URL=https://todo-list-e7788-default-rtdb.firebaseio.com
   FIREBASE_CREDENTIALS_PATH=storage/app/firebase-credentials.json
   ```

3. **Deploy Firebase Database Rules**:
   ```bash
   firebase deploy --only database
   ```

### Option 2: Firebase Hosting + Cloud Run (Serverless)

#### Prerequisites
- Google Cloud Project with billing enabled
- Docker installed locally
- gcloud CLI configured

#### Steps
1. **Build Docker image**:
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/todo-app .
   ```

2. **Push to Google Container Registry**:
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/todo-app
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy todo-app \
     --image gcr.io/YOUR_PROJECT_ID/todo-app \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

4. **Update Firebase Hosting** to point to Cloud Run URL

### Option 3: Traditional Web Server Deployment

#### Prerequisites
- Web server (Apache/Nginx) with PHP 8.0+ support
- Composer for PHP dependencies
- Node.js for frontend assets
- SSL certificate for HTTPS

#### Deployment Steps
1. **Upload Laravel files** to your web server
2. **Install dependencies**:
   ```bash
   composer install --optimize-autoloader --no-dev
   npm install && npm run build
   ```

3. **Configure web server** to point to `public/` directory
4. **Set up environment variables** in `.env`
5. **Configure SSL** and redirect HTTP to HTTPS

## Local Development

### Running Laravel Locally
```bash
# Install dependencies
composer install
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run development server
php artisan serve
```

### Running Firebase Emulators
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start
```

## Environment Configuration

### Required Environment Variables
```env
APP_NAME="Firebase Todo App"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://todo.cox-fam.com

FIREBASE_PROJECT_ID=todo-list-e7788
FIREBASE_DATABASE_URL=https://todo-list-e7788-default-rtdb.firebaseio.com
FIREBASE_CREDENTIALS_PATH=storage/app/firebase-credentials.json

DB_CONNECTION=firebase
```

### Firebase Credentials
1. Download service account key from Firebase Console
2. Place in `storage/app/firebase-credentials.json`
3. Ensure file permissions are secure (600)

## Testing

### Run API Tests
```bash
php artisan test tests/Feature/Api/
```

### Run All Tests
```bash
php artisan test
```

## Monitoring and Maintenance

### Firebase Console
- Monitor database usage and performance
- View authentication logs
- Check hosting analytics

### Laravel Logs
- Application logs: `storage/logs/laravel.log`
- Monitor for errors and performance issues

### Database Rules
- Current rules allow full read/write access for development
- **Important**: Restrict access in production based on authentication

## Troubleshooting

### Common Issues
1. **Firebase connection timeout**: Check credentials and network
2. **Authentication failures**: Verify OAuth client setup
3. **Database permission errors**: Check Firebase security rules
4. **CORS issues**: Verify Firebase Hosting headers configuration

### Debug Mode
Enable debug mode temporarily:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

## Security Considerations

### Production Checklist
- [ ] Disable debug mode (`APP_DEBUG=false`)
- [ ] Use HTTPS only
- [ ] Restrict Firebase database rules
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Monitor authentication logs

### Firebase Security Rules
Current rules allow full access. For production, implement proper authentication-based rules:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "todos": {
      "$todoId": {
        ".read": "data.child('user_id').val() === auth.uid",
        ".write": "data.child('user_id').val() === auth.uid || !data.exists()"
      }
    }
  }
}
```

## Support and Resources

- Laravel documentation: https://laravel.com/docs
- Firebase documentation: https://firebase.google.com/docs
- API documentation: https://todo.cox-fam.com/apidoc (after deployment)
