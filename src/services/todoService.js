import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const todoService = {
  // Get all todos
  getAllTodos: async () => {
    return apiClient.get('/todos');
  },

  // Get a specific todo
  getTodo: async (id) => {
    return apiClient.get(`/todos/${id}`);
  },

  // Create a new todo
  createTodo: async (todoData) => {
    return apiClient.post('/todos', todoData);
  },

  // Update a todo
  updateTodo: async (id, todoData) => {
    return apiClient.put(`/todos/${id}`, todoData);
  },

  // Delete a todo
  deleteTodo: async (id) => {
    return apiClient.delete(`/todos/${id}`);
  },

  // Toggle todo completion status
  toggleTodo: async (id) => {
    return apiClient.patch(`/todos/${id}/toggle`);
  },
};
