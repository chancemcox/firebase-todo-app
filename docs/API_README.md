# 🔐 Todo API with OAuth2 Authentication

A comprehensive REST API for managing todos with OAuth2 authentication, built with Express.js and Firebase Firestore.

## 🚀 Quick Start

### Start the API Server
```bash
# Start only the API server
npm run server

# Start both API server and frontend (development)
npm run start

# Start API server with auto-reload
npm run server:dev
```

### Access Points
- **API Server**: http://localhost:5001
- **API Documentation**: http://localhost:5001/api-docs
- **Health Check**: http://localhost:5001/health

## 📚 API Documentation

Full interactive documentation is available at `/api-docs` when the server is running.

## 🔑 OAuth2 Authentication

### 1. Create an OAuth Client

```bash
curl -X POST http://localhost:5001/api/auth/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Todo App",
    "redirectUris": ["http://localhost:3000/callback"],
    "grants": ["password", "refresh_token"]
  }'
```

**Response:**
```json
{
  "clientId": "client_abc123",
  "clientSecret": "secret_xyz789",
  "name": "My Todo App",
  "redirectUris": ["http://localhost:3000/callback"],
  "grants": ["password", "refresh_token"]
}
```

### 2. Get Access Token

```bash
curl -X POST http://localhost:5001/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=client_abc123&client_secret=secret_xyz789&username=user@example.com&password=password123&scope=read write"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def456...",
  "scope": "read write"
}
```

### 3. Use Access Token

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5001/api/todos
```

## 📝 Todo Endpoints

### Get All Todos
```bash
GET /api/todos?filter=active&priority=high&limit=10
Authorization: Bearer <access_token>
```

### Get Specific Todo
```bash
GET /api/todos/:id
Authorization: Bearer <access_token>
```

### Create Todo
```bash
POST /api/todos
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Complete API documentation",
  "description": "Write comprehensive API docs",
  "priority": "high",
  "tags": ["documentation", "api"]
}
```

### Update Todo
```bash
PUT /api/todos/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

### Toggle Todo Completion
```bash
PATCH /api/todos/:id/toggle
Authorization: Bearer <access_token>
```

### Delete Todo
```bash
DELETE /api/todos/:id
Authorization: Bearer <access_token>
```

## 🧪 Testing the API

### 1. Test Health Check
```bash
curl http://localhost:5001/health
```

### 2. Test OAuth Client Creation
```bash
curl -X POST http://localhost:5001/api/auth/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Client"}'
```

### 3. Test Token Generation
```bash
# First, get client credentials from step 2
curl -X POST http://localhost:5001/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&username=test@example.com&password=test123"
```

### 4. Test Todo Operations
```bash
# Create todo
curl -X POST http://localhost:5001/api/todos \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Todo", "priority": "high"}'

# Get todos
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:5001/api/todos
```

## 🔧 Configuration

### Environment Variables
```bash
PORT=5001                    # API server port
NODE_ENV=development         # Environment
```

### Firebase Configuration
The API uses the same Firebase configuration as the frontend (`src/firebase.js`).

## 🏗️ Architecture

```
server/
├── server.js          # Main Express server
├── oauth.js          # OAuth2 server configuration
└── routes/
    ├── auth.js       # Authentication routes
    └── todos.js      # Todo CRUD routes
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **OAuth2**: Industry-standard authentication
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error handling

## 📊 Database Schema

### OAuth Clients Collection
```javascript
{
  name: "Client Name",
  clientId: "unique_client_id",
  clientSecret: "hashed_secret",
  redirectUris: ["http://localhost:3000/callback"],
  grants: ["password", "refresh_token"],
  active: true,
  createdAt: "2025-01-16T..."
}
```

### OAuth Tokens Collection
```javascript
{
  accessToken: "jwt_token",
  accessTokenExpiresAt: "2025-01-16T...",
  refreshToken: "refresh_token",
  refreshTokenExpiresAt: "2025-01-16T...",
  clientId: "client_id",
  userId: "user_id",
  scope: "read write",
  createdAt: "2025-01-16T..."
}
```

### Todos Collection
```javascript
{
  title: "Todo Title",
  description: "Todo Description",
  priority: "high|medium|low",
  tags: ["tag1", "tag2"],
  completed: false,
  userId: "user_id",
  createdAt: "2025-01-16T...",
  updatedAt: "2025-01-16T..."
}
```

## 🚀 Deployment

### Local Development
```bash
npm run start
```

### Production
```bash
npm run build
npm run server
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 5001
   lsof -i :5001
   # Kill the process or change PORT in .env
   ```

2. **Firebase Connection Issues**
   - Verify Firebase configuration in `src/firebase.js`
   - Check Firestore rules and indexes

3. **OAuth Token Issues**
   - Verify client credentials
   - Check token expiration
   - Ensure proper Authorization header format

### Logs
The server uses Morgan for logging. Check console output for detailed request/response logs.

## 📞 Support

For issues or questions:
- Check the API documentation at `/api-docs`
- Review server logs
- Verify Firebase configuration
- Test with the provided examples

---

**Built with ❤️ by Chance Cox**
