import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createTodo, 
  getUserTodos, 
  updateTodo as updateTodoService, 
  deleteTodo as deleteTodoService,
  toggleTodoCompletion 
} from '../services/todoService.js';

const initialState = {
  todos: [],
  status: 'idle',
  error: null,
  filter: 'all',
  loading: false
};

// Async thunks for Firebase operations
export const fetchUserTodos = createAsyncThunk(
  'todos/fetchUserTodos',
  async (userId) => {
    console.log('Redux: Fetching todos for user:', userId);
    const todos = await getUserTodos(userId);
    console.log('Redux: Fetched todos:', todos);
    return todos;
  }
);

export const addTodo = createAsyncThunk(
  'todos/addTodo',
  async ({ todoData, userId }) => {
    console.log('Redux: Adding todo:', { todoData, userId });
    const newTodo = await createTodo(todoData, userId);
    console.log('Redux: Todo added successfully:', newTodo);
    return newTodo;
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, updates }) => {
    console.log('Redux: Updating todo:', { id, updates });
    const updatedTodo = await updateTodoService(id, updates);
    console.log('Redux: Todo updated successfully:', updatedTodo);
    return updatedTodo;
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id) => {
    console.log('Redux: Deleting todo:', id);
    await deleteTodoService(id);
    console.log('Redux: Todo deleted successfully');
    return id;
  }
);

export const toggleComplete = createAsyncThunk(
  'todos/toggleComplete',
  async ({ id, completed }) => {
    console.log('Redux: Toggling todo completion:', { id, completed });
    const result = await toggleTodoCompletion(id, completed);
    console.log('Redux: Todo completion toggled successfully:', result);
    return result;
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch todos
      .addCase(fetchUserTodos.pending, (state) => {
        console.log('Redux: fetchUserTodos.pending');
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchUserTodos.fulfilled, (state, action) => {
        console.log('Redux: fetchUserTodos.fulfilled with payload:', action.payload);
        state.status = 'succeeded';
        state.todos = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserTodos.rejected, (state, action) => {
        console.log('Redux: fetchUserTodos.rejected with error:', action.error);
        state.status = 'failed';
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add todo
      .addCase(addTodo.pending, (state) => {
        console.log('Redux: addTodo.pending');
        state.loading = true;
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        console.log('Redux: addTodo.fulfilled with payload:', action.payload);
        state.todos.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addTodo.rejected, (state, action) => {
        console.log('Redux: addTodo.rejected with error:', action.error);
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update todo
      .addCase(updateTodo.pending, (state) => {
        console.log('Redux: updateTodo.pending');
        state.loading = true;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        console.log('Redux: updateTodo.fulfilled with payload:', action.payload);
        const index = state.todos.findIndex(todo => todo.id === action.payload.id);
        if (index !== -1) {
          state.todos[index] = { ...state.todos[index], ...action.payload };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateTodo.rejected, (state, action) => {
        console.log('Redux: updateTodo.rejected with error:', action.error);
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete todo
      .addCase(deleteTodo.pending, (state) => {
        console.log('Redux: deleteTodo.pending');
        state.loading = true;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        console.log('Redux: deleteTodo.fulfilled with payload:', action.payload);
        state.todos = state.todos.filter(todo => todo.id !== action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        console.log('Redux: deleteTodo.rejected with error:', action.error);
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Toggle complete
      .addCase(toggleComplete.pending, (state) => {
        console.log('Redux: toggleComplete.pending');
        state.loading = true;
      })
      .addCase(toggleComplete.fulfilled, (state, action) => {
        console.log('Redux: toggleComplete.fulfilled with payload:', action.payload);
        const todo = state.todos.find(t => t.id === action.payload.id);
        if (todo) {
          todo.completed = action.payload.completed;
          todo.updatedAt = new Date().toISOString();
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(toggleComplete.rejected, (state, action) => {
        console.log('Redux: toggleComplete.rejected with error:', action.error);
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setFilter, clearError, setLoading } = todoSlice.actions;
export default todoSlice.reducer;
