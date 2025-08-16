# TaskFlow - Firebase Todo Application

## Project Overview
TaskFlow is a serverless, scalable todo application built with Laravel PHP backend and Firebase infrastructure. The application provides a REST API with OAuth2 token authentication, Google OAuth integration, and a modern web interface.

## Architecture

### Backend
- **Framework**: Laravel 9 (PHP 8.0.8)
- **Authentication**: Laravel Passport with Firebase OAuth storage
- **Database**: Firebase Realtime Database (no local database)
- **API Documentation**: L5-Swagger with OpenAPI/Swagger UI

### Frontend
- **Hosting**: Firebase Hosting
- **Static Files**: Served from Firebase Hosting
- **Dynamic Content**: Laravel PHP backend at `https://todo.cox-fam.com/`

### Infrastructure
- **Firebase Project**: `todo-list-e7788`
- **Custom Domain**: `todo.cox-fam.com`
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth + Google OAuth

## Key Features

### Authentication & Authorization
- OAuth2 token-based API authentication
- Google OAuth integration for web login
- Firebase-based user management
- Custom Firebase OAuth storage for Passport

### API Endpoints
- **Authentication**: `/api/auth/*`
  - Register, Login, Logout, Refresh tokens
- **Todos**: `/api/todos/*`
  - CRUD operations for todo items
  - User-specific todo management
- **Users**: `/api/users/*`
  - User profile management
  - Account operations

### Todo Management
- Create, read, update, delete todos
- Mark todos as complete/incomplete
- Priority levels and due dates
- User-specific todo lists
- Task sharing capabilities

## Technical Implementation

### Firebase Integration
- **Custom OAuth Storage**: `FirebaseOAuthStorage` service
- **Passport Bridge**: `FirebasePassportBridge` service
- **Model Adaptation**: Firebase-aware User and Todo models
- **Authentication Middleware**: Custom `FirebaseApiAuth` middleware

### Database Schema
```json
{
  "users": {
    "userId": {
      "email": "user@example.com",
      "name": "User Name",
      "google_id": "google_oauth_id",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  },
  "todos": {
    "todoId": {
      "title": "Todo Title",
      "description": "Todo Description",
      "completed": false,
      "user_id": "userId",
      "due_date": "timestamp",
      "priority": "high|medium|low",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  },
  "oauth": {
    "clients": {
      "clientId": {
        "name": "Client Name",
        "secret": "client_secret",
        "redirect": "redirect_uri",
        "personal_access_client": false,
        "password_client": false,
        "revoked": false
      }
    },
    "access_tokens": {
      "tokenId": {
        "id": "token_id",
        "user_id": "userId",
        "client_id": "clientId",
        "name": "token_name",
        "scopes": [],
        "revoked": false,
        "created_at": "timestamp",
        "updated_at": "timestamp",
        "expires_at": "timestamp"
      }
    }
  }
}
```

### Key Services

#### FirebaseOAuthStorage
- Stores OAuth clients, tokens, and user data in Firebase
- Implements Laravel Passport's OAuth storage interface
- Handles Firebase-specific data operations

#### FirebasePassportBridge
- Bridges Laravel Passport functionality with Firebase
- Manages token creation, validation, and revocation
- Handles user authentication state

#### User Model
- Implements Laravel's `Authenticatable` interface
- Firebase-aware data operations
- Magic methods for dynamic property access
- Custom authentication methods

#### Todo Model
- Firebase-aware todo management
- Route model binding without Eloquent
- User-specific todo filtering

### Middleware
- **FirebaseApiAuth**: Custom authentication middleware
- **CORS**: Cross-origin resource sharing for API
- **CSRF**: Cross-site request forgery protection

## File Structure

### Core Application Files
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── AuthController.php
│   │   │   ├── TodoController.php
│   │   │   └── UserController.php
│   │   ├── Auth/
│   │   │   └── GoogleController.php
│   │   └── Controller.php
│   ├── Middleware/
│   │   └── FirebaseApiAuth.php
│   └── Kernel.php
├── Models/
│   ├── User.php
│   └── Todo.php
├── Services/
│   ├── FirebaseOAuthStorage.php
│   └── FirebasePassportBridge.php
└── Providers/
    └── AppServiceProvider.php
```

### Configuration Files
```
config/
├── auth.php          # Authentication configuration
├── database.php      # Firebase database config
├── firebase.php      # Firebase service config
├── passport.php      # Passport configuration
└── services.php      # Google OAuth config
```

### Routes
```
routes/
├── api.php           # API endpoints
├── auth.php          # Authentication routes
└── web.php           # Web routes (including /apidoc)
```

### Views
```
resources/views/
├── home.blade.php    # Product landing page
├── auth/
│   └── login.blade.php  # Login page with Google OAuth
└── apidoc.blade.php     # API documentation
```

### Firebase Configuration
```
firebase.json         # Firebase project configuration
database.rules.json   # Database security rules
public/
├── index.html        # Redirect page for Firebase Hosting
└── apidoc/
    └── index.html    # Static API documentation
```

## Testing

### Test Structure
```
tests/
├── Feature/
│   └── Api/
│       ├── AuthApiTest.php
│       └── TodoApiTest.php
└── TestCase.php
```

### Test Features
- Firebase backend testing
- API endpoint validation
- Authentication flow testing
- Todo CRUD operations testing
- No database assertions (Firebase-based)

## Deployment

### Firebase Hosting
- **Public Directory**: `public/`
- **Rewrites**: 
  - `/` → `https://todo.cox-fam.com/` (Laravel homepage)
  - `/api/**` → `https://todo.cox-fam.com/api/**` (Laravel API)
  - `/apidoc` → `/apidoc/index.html` (Static docs)
- **Headers**: CORS configuration for API endpoints

### Laravel Backend
- **URL**: `https://todo.cox-fam.com/`
- **Environment**: Production server with Laravel
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase + Google OAuth

## Environment Variables

### Required .env Variables
```env
# Firebase Configuration
FIREBASE_CREDENTIALS=storage/app/firebase-credentials.json
FIREBASE_DATABASE_URL=https://todo-list-e7788-default-rtdb.firebaseio.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://todo.cox-fam.com/auth/google/callback

# Laravel Configuration
APP_URL=https://todo.cox-fam.com
APP_ENV=production
APP_DEBUG=false

# Passport Configuration
PASSPORT_PERSONAL_ACCESS_CLIENT_ID=your_passport_client_id
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET=your_passport_client_secret
```

## API Documentation

### Swagger UI
- **URL**: `/apidoc`
- **Base URL**: `https://todo.cox-fam.com/api`
- **Authentication**: Bearer token (OAuth2)
- **Documentation**: OpenAPI 3.0 specification

### API Endpoints Summary
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
POST   /api/auth/refresh      # Token refresh
GET    /api/user              # Current user info
PUT    /api/user              # Update user profile
GET    /api/todos             # List user todos
POST   /api/todos             # Create new todo
GET    /api/todos/{id}        # Get specific todo
PUT    /api/todos/{id}        # Update todo
DELETE /api/todos/{id}        # Delete todo
POST   /api/todos/{id}/toggle # Toggle todo completion
```

## Security Features

### Authentication
- OAuth2 token-based API authentication
- Firebase security rules for database access
- Google OAuth for web authentication
- Token expiration and refresh mechanisms

### Data Protection
- User-specific data isolation
- Firebase Realtime Database security rules
- CORS configuration for API endpoints
- CSRF protection for web forms

## Performance & Scaling

### Serverless Architecture
- No local database dependencies
- Firebase auto-scaling
- Stateless Laravel backend
- CDN-enabled Firebase Hosting

### Optimization
- Firebase connection pooling
- Efficient data fetching strategies
- Minimal database queries
- Static file serving from Firebase

## Known Issues & Limitations

### Firebase Database Rules
- Persistent deployment issues with `database.rules.json`
- Workaround: Application-level filtering to avoid index requirements
- Security rules need manual configuration in Firebase Console

### Custom Domain
- Requires manual setup in Firebase Console
- SSL certificate management needed
- DNS configuration required

## Future Enhancements

### Planned Features
- Real-time todo updates using Firebase listeners
- Advanced task sharing and collaboration
- Mobile app support
- Enhanced reporting and analytics
- Integration with external calendar services

### Technical Improvements
- Firebase Functions for serverless backend
- Enhanced caching strategies
- Performance monitoring and optimization
- Automated testing pipeline
- CI/CD deployment automation

## Maintenance & Support

### Regular Tasks
- Monitor Firebase usage and costs
- Update Laravel and dependencies
- Review and update security rules
- Backup critical data
- Monitor application performance

### Troubleshooting
- Check Firebase Console for errors
- Review Laravel logs
- Verify environment variables
- Test API endpoints
- Check Firebase Hosting configuration

## Contact & Documentation
- **Project**: TaskFlow Todo Application
- **Framework**: Laravel 9 + Firebase
- **Architecture**: Serverless with PHP backend
- **Status**: Production ready
- **Last Updated**: January 2025
