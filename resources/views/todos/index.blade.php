@extends('layouts.app')

@section('content')
{{-- Main Todo Management Interface --}}
{{-- This view provides a comprehensive interface for managing todos including: --}}
{{-- - Adding new todos with title, description, and due date --}}
{{-- - Viewing existing todos with completion status --}}
{{-- - Editing todo details --}}
{{-- - Deleting todos --}}
{{-- - Toggling completion status --}}

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
        {{-- Page Header Section --}}
        {{-- Contains the main title and navigation back to dashboard --}}
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">My Tasks</h1>
                    <p class="text-gray-600">Manage your tasks and stay organized</p>
                </div>
                {{-- Navigation back to dashboard --}}
                <a href="{{ route('dashboard') }}" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                    <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                </a>
            </div>
        </div>

        {{-- Add New Task Form Section --}}
        {{-- Form for creating new todos with validation and Firebase integration --}}
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Add New Task</h2>
            <form id="addTodoForm" class="space-y-4">
                {{-- CSRF token for security --}}
                @csrf
                
                {{-- Task Title and Due Date Row --}}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {{-- Task Title Input (Required) --}}
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                        <input type="text" id="title" name="title" required 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                               placeholder="Enter task title">
                    </div>
                    
                    {{-- Due Date Input (Optional) --}}
                    <div>
                        <label for="due_date" class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                        <input type="date" id="due_date" name="due_date" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                </div>
                
                {{-- Task Description Input (Optional) --}}
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="description" name="description" rows="3" 
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter task description (optional)"></textarea>
                </div>
                
                {{-- Submit Button --}}
                <div class="flex justify-end">
                    <button type="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-plus mr-2"></i>Add Task
                    </button>
                </div>
            </form>
        </div>

        {{-- Tasks List Section --}}
        {{-- Displays all existing todos with interactive controls --}}
        <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
            
            {{-- Dynamic Todo List Container --}}
            {{-- JavaScript will populate this with todo items --}}
            <div id="todosList" class="space-y-4">
                {{-- Todo items will be dynamically inserted here --}}
            </div>
            
            {{-- Loading State --}}
            {{-- Shown while fetching todos from Firebase --}}
            <div id="loadingMessage" class="text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Loading tasks...</p>
            </div>
            
            {{-- Empty State --}}
            {{-- Shown when no todos exist --}}
            <div id="emptyMessage" class="text-center py-8 text-gray-500 hidden">
                <i class="fas fa-clipboard-list text-4xl mb-4 text-gray-300"></i>
                <p class="text-lg">No tasks yet</p>
                <p class="text-sm">Create your first task to get started!</p>
            </div>
        </div>
    </div>
</div>

{{-- Edit Task Modal --}}
{{-- Overlay modal for editing existing todos --}}
<div id="editModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Edit Task</h3>
            <form id="editTodoForm" class="space-y-4">
                {{-- CSRF token for security --}}
                @csrf
                
                {{-- Hidden field to store the todo ID being edited --}}
                <input type="hidden" id="editTodoId">
                
                {{-- Edit Task Title --}}
                <div>
                    <label for="editTitle" class="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                    <input type="text" id="editTitle" name="title" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                {{-- Edit Due Date --}}
                <div>
                    <label for="editDueDate" class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input type="date" id="editDueDate" name="due_date" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                
                {{-- Edit Description --}}
                <div>
                    <label for="editDescription" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="editDescription" name="description" rows="3" 
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                </div>
                
                {{-- Modal Action Buttons --}}
                <div class="flex justify-end space-x-3">
                    <button type="button" onclick="closeEditModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                        Update Task
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- JavaScript Dependencies --}}
{{-- Axios for HTTP requests to the API --}}
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

{{-- Main Application JavaScript --}}
<script>
    {{-- Initialize Axios with CSRF token for Laravel security --}}
    // Set up Axios defaults for CSRF token
    // This ensures all API requests include the CSRF token for security
    axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    {{-- Initialize the application when the DOM is loaded --}}
    // Load todos on page load
    document.addEventListener('DOMContentLoaded', function() {
        loadTodos();
    });

    {{-- Form Submission Handler for Adding New Todos --}}
    // Add new todo
    document.getElementById('addTodoForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        // Extract form data
        const formData = new FormData(this);
        const todoData = {
            title: formData.get('title'),
            description: formData.get('description'),
            due_date: formData.get('due_date')
        };

        // Send POST request to create new todo
        axios.post('/api/todos', todoData)
            .then(response => {
                if (response.data.success) {
                    // Clear the form after successful creation
                    this.reset();
                    // Reload the todos list to show the new item
                    loadTodos();
                    // Show success notification
                    showNotification('Task created successfully!', 'success');
                } else {
                    // Show error message from server
                    showNotification(response.data.message || 'Error creating task', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle different types of errors
                if (error.response && error.response.data) {
                    showNotification(error.response.data.message || 'Error creating task. Please try again.', 'error');
                } else {
                    showNotification('Error creating task. Please try again.', 'error');
                }
            });
    });

    {{-- Todo Loading Function --}}
    // Load todos from the API
    function loadTodos() {
        const todosList = document.getElementById('todosList');
        const loadingMessage = document.getElementById('loadingMessage');
        const emptyMessage = document.getElementById('emptyMessage');

        // Show loading state
        loadingMessage.classList.remove('hidden');
        todosList.innerHTML = '';

        // Fetch todos from the API
        axios.get('/api/todos')
            .then(response => {
                loadingMessage.classList.add('hidden');
                
                if (response.data.success && response.data.data) {
                    const todos = response.data.data;
                    const todoIds = Object.keys(todos);
                    
                    // Check if there are any todos
                    if (todoIds.length === 0) {
                        emptyMessage.classList.remove('hidden');
                        return;
                    }

                    // Hide empty message and display todos
                    emptyMessage.classList.add('hidden');
                    
                    // Create DOM elements for each todo
                    todoIds.forEach(id => {
                        const todo = todos[id];
                        const todoElement = createTodoElement(id, todo);
                        todosList.appendChild(todoElement);
                    });
                } else {
                    // Show empty state if no todos
                    emptyMessage.classList.remove('hidden');
                }
            })
            .catch(error => {
                loadingMessage.classList.add('hidden');
                console.error('Error loading todos:', error);
                
                // Handle authentication errors by redirecting to login
                if (error.response && error.response.status === 401) {
                    window.location.href = '/login';
                } else {
                    showNotification('Error loading tasks. Please try again.', 'error');
                }
            });
    }

    {{-- Todo Element Creation Function --}}
    // Create a DOM element for a single todo item
    function createTodoElement(id, todo) {
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
        
        // Build the HTML content for the todo item
        div.innerHTML = `
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3">
                        {{-- Completion Checkbox --}}
                        <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                               onchange="toggleTodo('${id}', this.checked)"
                               class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        
                        {{-- Todo Title with completion styling --}}
                        <h3 class="text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}">${todo.title}</h3>
                    </div>
                    
                    {{-- Optional Description --}}
                    ${todo.description ? `<p class="text-gray-600 mt-2 ml-8">${todo.description}</p>` : ''}
                    
                    {{-- Optional Due Date --}}
                    ${todo.due_date ? `<p class="text-sm text-gray-500 mt-2 ml-8"><i class="fas fa-calendar mr-1"></i>Due: ${todo.due_date}</p>` : ''}
                    
                    {{-- Creation Date --}}
                    <p class="text-xs text-gray-400 mt-2 ml-8">Created: ${new Date(todo.created_at).toLocaleDateString()}</p>
                </div>
                
                {{-- Action Buttons --}}
                <div class="flex items-center space-x-2 ml-4">
                    {{-- Edit Button --}}
                    <button onclick="editTodo('${id}', '${todo.title}', '${todo.description || ''}', '${todo.due_date || ''}')" 
                            class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    {{-- Delete Button --}}
                    <button onclick="deleteTodo('${id}')" 
                            class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        return div;
    }

    {{-- Todo Completion Toggle Function --}}
    // Toggle todo completion status
    function toggleTodo(id, completed) {
        axios.patch(`/api/todos/${id}/toggle`)
            .then(response => {
                if (response.data.success) {
                    loadTodos(); // Reload to show updated state
                } else {
                    showNotification(response.data.message || 'Error updating task', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error updating task. Please try again.', 'error');
            });
    }

    {{-- Todo Editing Functions --}}
    // Open edit modal with todo data
    function editTodo(id, title, description, dueDate) {
        document.getElementById('editTodoId').value = id;
        document.getElementById('editTitle').value = title;
        document.getElementById('editDescription').value = description;
        document.getElementById('editDueDate').value = dueDate;
        document.getElementById('editModal').classList.remove('hidden');
    }

    // Close edit modal
    function closeEditModal() {
        document.getElementById('editModal').classList.add('hidden');
    }

    {{-- Todo Update Form Handler --}}
    // Update todo form submission
    document.getElementById('editTodoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editTodoId').value;
        const formData = new FormData(this);
        const todoData = {
            title: formData.get('title'),
            description: formData.get('description'),
            due_date: formData.get('due_date')
        };

        // Send PUT request to update the todo
        axios.put(`/api/todos/${id}`, todoData)
            .then(response => {
                if (response.data.success) {
                    closeEditModal();
                    loadTodos();
                    showNotification('Task updated successfully!', 'success');
                } else {
                    showNotification(response.data.message || 'Error updating task', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error updating task. Please try again.', 'error');
            });
    });

    {{-- Todo Deletion Function --}}
    // Delete a todo with confirmation
    function deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            axios.delete(`/api/todos/${id}`)
                .then(response => {
                    if (response.data.success) {
                        loadTodos();
                        showNotification('Task deleted successfully!', 'success');
                    } else {
                        showNotification(response.data.message || 'Error deleting task', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Error deleting task. Please try again.', 'error');
                });
        }
    }

    {{-- Notification System --}}
    // Show notification messages to the user
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
</script>
@endsection
