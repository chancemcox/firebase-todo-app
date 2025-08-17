# Firebase Setup Guide

## Prerequisites
1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Node.js 18+ and npm

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter your project name
4. Follow the setup wizard

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
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
NODE_ENV=development
PORT=5000

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=todo-list-e7788.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=todo-list-e7788
REACT_APP_FIREBASE_STORAGE_BUCKET=todo-list-e7788.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here
REACT_APP_FIREBASE_APP_ID=your-app-id-here

# Frontend URL
REACT_APP_API_URL=http://localhost:5000/api

# Optional: Use Firestore emulator for local development
REACT_APP_USE_FIRESTORE_EMULATOR=false
```

### 5. Update Firestore Security Rules
In Firebase Console > Firestore Database > Rules, update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Note**: These rules allow authenticated users to read/write their own todos. For production, implement proper authentication and authorization.

## Testing the App

### Run Tests
```bash
npm test
```

### Start Development Server
```bash
./scripts/dev.sh
```

### Access the App
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

## API Endpoints

- `GET /api/todos` - Get all todos for authenticated user
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
  "userId": "user-identifier",
  "priority": "low|medium|high",
  "dueDate": "2024-01-01T00:00:00.000Z",
  "tags": ["tag1", "tag2"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Firestore Collections

- **todos**: User's todo items
- **users**: User profile information

## Troubleshooting

### Common Issues

1. **Firebase credentials not found**
   - Ensure the credentials file path is correct in `.env`
   - Check file permissions

2. **Database connection failed**
   - Verify Firestore is enabled in Firebase Console
   - Check if security rules allow access

3. **Permission denied**
   - Update Firestore security rules
   - Check service account permissions

### Debug Mode
Enable debug mode in `.env`:
```env
NODE_ENV=development
```

Check application logs in the console

### Local Development with Emulator
To use Firestore emulator locally:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Start emulator: `firebase emulators:start`
3. Set environment variable: `REACT_APP_USE_FIRESTORE_EMULATOR=true`
