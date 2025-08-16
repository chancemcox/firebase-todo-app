import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { todoService } from '../services/todoService';

// Async thunks
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await todoService.getAllTodos();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch todos');
    }
  }
);

export const createTodo = createAsyncThunk(
  'todos/createTodo',
  async (todoData, { rejectWithValue }) => {
    try {
      const response = await todoService.createTodo(todoData);
      return { id: response.data.id, ...todoData };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create todo');
    }
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, todoData }, { rejectWithValue }) => {
    try {
      const response = await todoService.updateTodo(id, todoData);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update todo');
    }
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id, { rejectWithValue }) => {
    try {
      await todoService.deleteTodo(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete todo');
    }
  }
);

export const toggleTodo = createAsyncThunk(
  'todos/toggleTodo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await todoService.toggleTodo(id);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to toggle todo');
    }
  }
);

const initialState = {
  todos: {},
  loading: false,
  error: null,
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create todo
      .addCase(createTodo.fulfilled, (state, action) => {
        state.todos[action.payload.id] = action.payload;
      })
      // Update todo
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.todos[action.payload.id] = action.payload;
      })
      // Delete todo
      .addCase(deleteTodo.fulfilled, (state, action) => {
        delete state.todos[action.payload];
      })
      // Toggle todo
      .addCase(toggleTodo.fulfilled, (state, action) => {
        state.todos[action.payload.id] = action.payload;
      });
  },
});

export const { clearError } = todoSlice.actions;
export default todoSlice.reducer;
