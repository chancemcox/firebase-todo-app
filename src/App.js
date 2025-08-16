import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TodoList from './pages/TodoList';
import AddTodo from './pages/AddTodo';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<TodoList />} />
          <Route path="/add" element={<AddTodo />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
