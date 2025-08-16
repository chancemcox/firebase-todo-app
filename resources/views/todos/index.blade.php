<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firebase Todo App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Firebase Todo App</h1>
        
        <!-- Add Todo Form -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Add New Todo</h2>
            <form id="todoForm" class="space-y-4">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title *</label>
                    <input type="text" id="title" name="title" required 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" rows="3" 
                              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                </div>
                <div>
                    <label for="due_date" class="block text-sm font-medium text-gray-700">Due Date</label>
                    <input type="date" id="due_date" name="due_date" 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <button type="submit" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Add Todo
                </button>
            </form>
        </div>

        <!-- Todos List -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Your Todos</h2>
            <div id="todosList" class="space-y-3">
                <!-- Todos will be loaded here -->
            </div>
        </div>
    </div>

    <script>
        // Load todos on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadTodos();
        });

        // Handle form submission
        document.getElementById('todoForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const todoData = {
                title: formData.get('title'),
                description: formData.get('description'),
                due_date: formData.get('due_date'),
                user_id: 'web-user-' + Date.now()
            };

            createTodo(todoData);
        });

        // Create todo
        async function createTodo(todoData) {
            try {
                const response = await axios.post('/api/todos', todoData);
                if (response.data.success) {
                    document.getElementById('todoForm').reset();
                    loadTodos();
                    alert('Todo created successfully!');
                }
            } catch (error) {
                console.error('Error creating todo:', error);
                alert('Error creating todo. Please try again.');
            }
        }

        // Load all todos
        async function loadTodos() {
            try {
                const response = await axios.get('/api/todos');
                if (response.data.success) {
                    displayTodos(response.data.data);
                }
            } catch (error) {
                console.error('Error loading todos:', error);
                document.getElementById('todosList').innerHTML = '<p class="text-red-500">Error loading todos</p>';
            }
        }

        // Display todos
        function displayTodos(todos) {
            const todosList = document.getElementById('todosList');
            
            if (!todos || Object.keys(todos).length === 0) {
                todosList.innerHTML = '<p class="text-gray-500 text-center py-4">No todos yet. Create your first one!</p>';
                return;
            }

            const todosHtml = Object.entries(todos).map(([id, todo]) => `
                <div class="border rounded-lg p-4 ${todo.completed ? 'bg-green-50' : 'bg-white'}">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h3 class="font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}">${todo.title}</h3>
                            ${todo.description ? `<p class="text-gray-600 mt-1">${todo.description}</p>` : ''}
                            ${todo.due_date ? `<p class="text-sm text-gray-500 mt-2">Due: ${todo.due_date}</p>` : ''}
                        </div>
                        <div class="flex space-x-2 ml-4">
                            <button onclick="toggleTodo('${id}')" 
                                    class="px-3 py-1 text-sm rounded ${todo.completed ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'} hover:opacity-80">
                                ${todo.completed ? 'Undo' : 'Complete'}
                            </button>
                            <button onclick="deleteTodo('${id}')" 
                                    class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            todosList.innerHTML = todosHtml;
        }

        // Toggle todo completion
        async function toggleTodo(id) {
            try {
                const response = await axios.patch(`/api/todos/${id}/toggle`);
                if (response.data.success) {
                    loadTodos();
                }
            } catch (error) {
                console.error('Error toggling todo:', error);
                alert('Error updating todo. Please try again.');
            }
        }

        // Delete todo
        async function deleteTodo(id) {
            if (!confirm('Are you sure you want to delete this todo?')) {
                return;
            }

            try {
                const response = await axios.delete(`/api/todos/${id}`);
                if (response.data.success) {
                    loadTodos();
                    alert('Todo deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting todo:', error);
                alert('Error deleting todo. Please try again.');
            }
        }
    </script>
</body>
</html>
