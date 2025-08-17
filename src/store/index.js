import { configureStore } from '@reduxjs/toolkit'
import todoReducer from './todoSlice.js'

export const store = configureStore({
  reducer: {
    todos: todoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['todos/addTodo', 'todos/updateTodo'],
        ignoredPaths: ['todos.todos'],
      },
    }),
})

export default store
