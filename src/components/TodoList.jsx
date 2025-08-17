import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { 
  addTodo, 
  toggleComplete, 
  deleteTodo, 
  updateTodo, 
  setFilter,
  fetchUserTodos,
  clearError 
} from '../store/todoSlice.js';

const TodoList = () => {
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  const todos = useSelector((state) => state.todos.todos);
  const filter = useSelector((state) => state.todos.filter);
  const status = useSelector((state) => state.todos.status);
  const loading = useSelector((state) => state.todos.loading);
  const error = useSelector((state) => state.todos.error);
  
  const dispatch = useDispatch();
  const { currentUser } = useAuth();

  // Fetch todos when component mounts or user changes
  useEffect(() => {
    if (currentUser?.uid) {
      dispatch(fetchUserTodos(currentUser.uid));
    }
  }, [currentUser?.uid, dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTodo.title.trim() && currentUser?.uid) {
      try {
        // Add user ID to the todo
        const todoWithUser = {
          ...newTodo,
          userEmail: currentUser.email,
          userName: currentUser.displayName || currentUser.email
        };
        
        await dispatch(addTodo({ todoData: todoWithUser, userId: currentUser.uid })).unwrap();
        
        // Reset form
        setNewTodo({
          title: '',
          description: '',
          priority: 'medium',
          tags: []
        });
      } catch (error) {
        console.error('Failed to add todo:', error);
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newTodo.tags.includes(tagInput.trim())) {
      setNewTodo({
        ...newTodo,
        tags: [...newTodo.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewTodo({
      ...newTodo,
      tags: newTodo.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleToggleComplete = async (todoId, currentCompleted) => {
    try {
      await dispatch(toggleComplete({ id: todoId, completed: currentCompleted })).unwrap();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await dispatch(deleteTodo(todoId)).unwrap();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  // Filter todos by current user
  const userTodos = todos.filter(todo => todo.userId === currentUser?.uid);
  
  const filteredTodos = userTodos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  if (status === 'loading' && todos.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white text-lg">Loading your todos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          <strong>Error:</strong> {error}
          <button
            onClick={() => dispatch(clearError())}
            className="ml-2 text-red-700 hover:text-red-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Add Todo Form */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Todo</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What needs to be done?"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add more details..."
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                Add
              </button>
            </div>
            {newTodo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newTodo.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !newTodo.title.trim()}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Todo...' : 'Add Todo'}
          </button>
        </form>
      </div>
      
      {/* Filter Buttons */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => dispatch(setFilter('all'))}
          className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          All
        </button>
        <button
          onClick={() => dispatch(setFilter('active'))}
          className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Active
        </button>
        <button
          onClick={() => dispatch(setFilter('completed'))}
          className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Completed
        </button>
      </div>
      
      {/* Todo List */}
      <div className="space-y-4">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white text-lg">
              {userTodos.length === 0 ? 'No todos yet. Add one above!' : 'No todos match your current filter.'}
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div key={todo.id} className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id, todo.completed)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  disabled={loading}
                />
                
                <div className="flex-1">
                  <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {todo.title}
                  </h3>
                  
                  {todo.description && (
                    <p className={`mt-1 text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {todo.description}
                    </p>
                  )}
                  
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                      todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority}
                    </span>
                    
                    {todo.tags && todo.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {todo.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Created: {new Date(todo.createdAt).toLocaleDateString()}
                    {todo.updatedAt && ` • Updated: ${new Date(todo.updatedAt).toLocaleDateString()}`}
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={loading}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
