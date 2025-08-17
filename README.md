# Firebase Todo App

A modern, real-time todo application built with React, Node.js, and Firebase.

## Features

- 🔐 **Authentication** - Email/password and Google Sign-in
- 📝 **Real-time Todos** - Live updates using Firestore
- ⏰ **Due Dates** - Set deadlines and reminders for tasks
- 🏷️ **Tags & Priority** - Organize tasks with tags and priority levels
- 📊 **Statistics** - Real-time analytics and progress tracking
- 🔌 **API Server** - OAuth2 protected REST API
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Real-time Updates** - WebSocket-like functionality with Firestore

## Tech Stack

- **Frontend**: React 18, Redux Toolkit, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Testing**: Jest, React Testing Library, Playwright

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chancemcox/firebase-todo-app.git
   cd firebase-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   npm run test:e2e
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start Express API server
- `npm run server:dev` - Start server with nodemon
- `npm test` - Run Jest tests
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── contexts/            # React contexts (Auth)
│   ├── pages/               # Page components
│   ├── store/               # Redux store
│   └── services/            # Firebase services
├── server/                  # Express API server
├── public/                  # Static assets
├── dist/                    # Build output
└── tests/                   # Test files
```

## API Documentation

The application includes a comprehensive REST API with OAuth2 authentication. Access the interactive API documentation at:

- **Development**: http://localhost:5001/api-docs
- **Production**: https://your-domain.com/api-docs

## Testing

### Unit Tests
- Jest configuration with React Testing Library
- Firebase mocks for isolated testing
- Code coverage reporting

### End-to-End Tests
- Playwright for browser automation
- Cross-browser testing support
- Visual regression testing

## Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### API Server
```bash
npm run build
npm run server
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ by Chance Cox using modern web technologies**
