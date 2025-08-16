# Firebase Setup Guide

## Prerequisites
1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. PHP 8.0+ (TaskFlow requires PHP 8.0+)

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name
4. Follow the setup wizard

### 2. Enable Realtime Database
1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose a location
4. Start in test mode (we'll update security rules later)

### 3. Get Service Account Credentials
1. Go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Place it in `storage/app/firebase-credentials.json`

### 4. Update Environment Variables
Add these to your `.env` file:

```env
FIREBASE_PROJECT=your-project-id
FIREBASE_CREDENTIALS=storage/app/firebase-credentials.json
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
FIREBASE_STORAGE_DEFAULT_BUCKET=your-project-id.appspot.com
```

### 5. Update Security Rules
In Firebase Console > Realtime Database > Rules, update to:

```json
{
  "rules": {
    "todos": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Note**: These rules allow public read/write access. For production, implement proper authentication.

## Testing the App

### Run Tests
```bash
php artisan test
```

### Start Development Server
```bash
php artisan serve
```

### Access the App
- Web Interface: http://localhost:8000/todos
- API Endpoints: http://localhost:8000/api/todos

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `GET /api/todos/{id}` - Get specific todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo
- `PATCH /api/todos/{id}/toggle` - Toggle completion status

## Todo Data Structure

```json
{
  "title": "Todo title",
  "description": "Todo description",
  "completed": false,
  "user_id": "user-identifier",
  "due_date": "2024-01-01",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Firebase credentials not found**
   - Ensure the credentials file path is correct in `.env`
   - Check file permissions

2. **Database connection failed**
   - Verify `FIREBASE_DATABASE_URL` is correct
   - Check if Realtime Database is enabled

3. **Permission denied**
   - Update Firebase security rules
   - Check service account permissions

### Debug Mode
Enable debug mode in `.env`:
```env
APP_DEBUG=true
```

Check application logs in `storage/logs/laravel.log`
