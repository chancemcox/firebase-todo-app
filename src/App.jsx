import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navigation from './components/Navigation.jsx'
import TodoList from './components/TodoList.jsx'
import UserProfile from './components/UserProfile.jsx'
import TodoStats from './components/TodoStats.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('todos');

  const renderSection = () => {
    switch (activeSection) {
      case 'todos':
        return <TodoList />;
      case 'profile':
        return <UserProfile />;
      case 'stats':
        return <TodoStats />;
      default:
        return <TodoList />;
    }
  };

  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto p-6">
                  <Navigation 
                    activeSection={activeSection} 
                    onSectionChange={setActiveSection} 
                  />
                  {renderSection()}
                </div>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
