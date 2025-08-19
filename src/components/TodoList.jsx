import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import DateTimeModal from './DateTimeModal';

const TodoList = () => {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium', 
    tags: [],
    dueDateTime: null,
    reminder: 'none'
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Create real-time listener for todos
      const todosRef = collection(db, 'todos');
      // Avoid requiring composite index by skipping orderBy and sorting client-side
      const q = query(
        todosRef,
        where('userId', '==', currentUser.uid)
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const todosData = [];
        snapshot.forEach((doc) => {
          todosData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            dueDateTime: doc.data().dueDateTime ? new Date(doc.data().dueDateTime) : null
          });
        });

        // Sort by createdAt desc on client
        const sorted = todosData.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
        setTodos(sorted);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to todos:', error);
        setError('Failed to load todos');
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      setError('Failed to set up real-time updates');
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTodo.title.trim()) return;

    try {
      const todoData = {
        title: newTodo.title.trim(),
        description: newTodo.description?.trim() || '',
        priority: newTodo.priority,
        tags: newTodo.tags.filter(tag => tag.trim()),
        completed: false,
        userId: currentUser.uid,
        dueDateTime: newTodo.dueDateTime,
        reminder: newTodo.reminder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'todos'), todoData);
      
      // Reset form
      setNewTodo({ 
        title: '', 
        description: '', 
        priority: 'medium', 
        tags: [],
        dueDateTime: null,
        reminder: 'none'
      });
    } catch (error) {
      console.error('Error creating todo:', error);
      setError('Failed to create todo');
    }
  };

  const handleToggleComplete = async (todoId, currentStatus) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        completed: !currentStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await deleteDoc(doc(db, 'todos', todoId));
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo');
    }
  };

  const handleUpdateDueDate = async (todoId, dueDateData) => {
    try {
      const todoRef = doc(db, 'todos', todoId);
      await updateDoc(todoRef, {
        dueDateTime: dueDateData.dueDateTime,
        reminder: dueDateData.reminder,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating due date:', error);
      setError('Failed to update due date');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !newTodo.tags.includes(newTag.trim())) {
      setNewTodo(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewTodo(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const openDateTimeModal = (todo = null) => {
    if (todo) {
      setEditingTodo(todo);
      setShowDateTimeModal(true);
    } else {
      setEditingTodo(null);
      setShowDateTimeModal(true);
    }
  };

  const handleDateTimeSave = (dueDateData) => {
    if (editingTodo) {
      // Editing existing todo
      handleUpdateDueDate(editingTodo.id, dueDateData);
    } else {
      // Setting due date for new todo
      setNewTodo(prev => ({
        ...prev,
        dueDateTime: dueDateData.dueDateTime,
        reminder: dueDateData.reminder
      }));
    }
  };

  const getDueDateDisplay = (dueDateTime) => {
    if (!dueDateTime) return null;
    
    const now = new Date();
    const dueDate = new Date(dueDateTime);
    const isPast = dueDate < now;
    const isToday = dueDate.toDateString() === now.toDateString();
    const isTomorrow = dueDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    
    let displayText = '';
    let colorClass = '';
    
    if (isPast) {
      displayText = `Overdue: ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      colorClass = 'text-red-600 bg-red-50 border-red-200';
    } else if (isToday) {
      displayText = `Due today at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
    } else if (isTomorrow) {
      displayText = `Due tomorrow at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      colorClass = 'text-blue-600 bg-blue-50 border-blue-200';
    } else {
      displayText = `Due ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      colorClass = 'text-green-600 bg-green-50 border-green-200';
    }
    
    return { text: displayText, colorClass };
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    if (filter === 'overdue') return todo.dueDateTime && new Date(todo.dueDateTime) < new Date() && !todo.completed;
    if (filter === 'due-today') {
      const today = new Date();
      return todo.dueDateTime && 
             new Date(todo.dueDateTime).toDateString() === today.toDateString() && 
             !todo.completed;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Todo List</h2>
          <p className="text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Todo List</h2>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-green-600 font-medium">Live Updates</span>
        </div>
      </div>

      {/* Add Todo Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={newTodo.title}
              onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What needs to be done?"
              required
            />
          </div>
          
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={newTodo.priority}
              onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={newTodo.description}
            onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Additional details..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="due-date-time" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date & Time
            </label>
            <div className="flex space-x-2">
              <button
                id="due-date-time"
                type="button"
                onClick={() => openDateTimeModal()}
                className={`flex-1 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  newTodo.dueDateTime
                    ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {newTodo.dueDateTime 
                  ? new Date(newTodo.dueDateTime).toLocaleDateString() + ' ' + 
                    new Date(newTodo.dueDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Set Due Date'
                }
              </button>
              {newTodo.dueDateTime && (
                <button
                  type="button"
                  onClick={() => setNewTodo(prev => ({ ...prev, dueDateTime: null, reminder: 'none' }))}
                  className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove due date"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {newTodo.reminder !== 'none' && (
              <p className="text-xs text-gray-600 mt-1">
                Reminder: {newTodo.reminder === 'custom' ? 'Custom' : `${newTodo.reminder} before`}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tags-input" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                id="tags-input"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!newTodo.title.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Todo
        </button>
      </form>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'active', 'completed', 'overdue', 'due-today'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterType === 'all' && 'All'}
            {filterType === 'active' && 'Active'}
            {filterType === 'completed' && 'Completed'}
            {filterType === 'overdue' && 'Overdue'}
            {filterType === 'due-today' && 'Due Today'}
          </button>
        ))}
      </div>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">
            {filter === 'all' 
              ? 'No todos yet. Create your first one above!' 
              : `No ${filter} todos.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo) => {
            const dueDateDisplay = getDueDateDisplay(todo.dueDateTime);
            
            return (
              <div
                key={todo.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  todo.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleComplete(todo.id, todo.completed)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <h3 className={`text-lg font-medium ${
                        todo.completed ? 'text-green-800 line-through' : 'text-gray-800'
                      }`}>
                        {todo.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                        todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {todo.priority}
                      </span>
                    </div>
                    
                    {todo.description && (
                      <p className={`mt-2 ${
                        todo.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {todo.description}
                      </p>
                    )}

                    {/* Due Date Display */}
                    {dueDateDisplay && (
                      <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${dueDateDisplay.colorClass}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                        </svg>
                        {dueDateDisplay.text}
                      </div>
                    )}
                    
                    {todo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {todo.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-3">
                      Created: {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString()}
                      {todo.updatedAt !== todo.createdAt && (
                        <span className="ml-4">
                          Updated: {todo.updatedAt.toLocaleDateString()} at {todo.updatedAt.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Due Date Button */}
                    <button
                      onClick={() => openDateTimeModal(todo)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit due date"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete todo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Real-time status */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total todos: {todos.length}</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Connected to Firestore</span>
          </div>
        </div>
      </div>

      {/* DateTime Modal */}
      <DateTimeModal
        isOpen={showDateTimeModal}
        onClose={() => setShowDateTimeModal(false)}
        onSave={handleDateTimeSave}
        initialDateTime={editingTodo ? editingTodo.dueDateTime : null}
      />
    </div>
  );
};

export default TodoList;
