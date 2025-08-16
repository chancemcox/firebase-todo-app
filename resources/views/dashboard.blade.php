<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i class="fas fa-chart-line text-white text-xl"></i>
            </div>
            <div>
                <h2 class="text-2xl font-bold text-gray-800 leading-tight">
                    TaskFlow Dashboard
                </h2>
                <p class="text-gray-600 text-sm">Welcome to your productivity command center</p>
            </div>
        </div>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Welcome Section -->
            <div class="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 mb-8 text-white">
                <!-- Background Pattern -->
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
                <div class="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-x-12 -translate-y-12 animate-pulse delay-500"></div>
                
                <!-- Content -->
                <div class="relative z-10 flex items-center space-x-6">
                    <div class="w-24 h-24 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-xl">
                        <i class="fas fa-user text-4xl text-white"></i>
                    </div>
                    <div>
                        <h3 class="text-4xl font-bold text-white mb-3">Welcome back, {{ Auth::user()->name }}! 👋</h3>
                        <p class="text-white/90 text-xl leading-relaxed">Manage your tasks and boost your productivity with TaskFlow</p>
                    </div>
                </div>
                
                <!-- Decorative Elements -->
                <div class="absolute top-6 right-6 text-white/20">
                    <i class="fas fa-tasks text-5xl"></i>
                </div>
                <div class="absolute bottom-6 left-6 text-white/20">
                    <i class="fas fa-check-circle text-4xl"></i>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="group bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <i class="fas fa-tasks text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-500">Total Tasks</div>
                                <div class="text-3xl font-bold text-gray-900" id="totalTasks">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="group bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <i class="fas fa-check text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-500">Completed</div>
                                <div class="text-3xl font-bold text-gray-900" id="completedTasks">-</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="group bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="p-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <i class="fas fa-clock text-white text-xl"></i>
                                </div>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-500">Pending</div>
                                <div class="text-3xl font-bold text-gray-900" id="pendingTasks">-</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Task Form -->
            <div class="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl mb-8 border border-gray-200/50">
                <div class="p-8">
                    <div class="flex items-center space-x-3 mb-6">
                        <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <i class="fas fa-plus text-white text-xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900">Add New Task</h3>
                    </div>
                    <form id="taskForm" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-edit mr-2 text-blue-500"></i>Task Title *
                                </label>
                                <input type="text" id="title" name="title" required 
                                       placeholder="What needs to be done?"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400">
                            </div>
                            <div>
                                <label for="due_date" class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-calendar mr-2 text-purple-500"></i>Due Date
                                </label>
                                <input type="date" id="due_date" name="due_date" 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-700">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="due_time" class="block text-sm font-semibold text-gray-700 mb-2">
                                    <i class="fas fa-clock mr-2 text-orange-500"></i>Due Time
                                </label>
                                <input type="time" id="due_time" name="due_time" 
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-700">
                            </div>
                            <div class="flex items-end">
                                <button type="submit" 
                                        class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    <i class="fas fa-plus mr-2"></i>Add Task
                                </button>
                            </div>
                        </div>
                        <div>
                            <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-align-left mr-2 text-green-500"></i>Description
                            </label>
                            <textarea id="description" name="description" rows="3" 
                                      placeholder="Add more details about this task..."
                                      class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-700 placeholder-gray-400"></textarea>
                        </div>
                    </form>
                </div>
            </div>

            <!-- All Tasks -->
            <div class="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50">
                <div class="p-8">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center space-x-3">
                            <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                <i class="fas fa-list-check text-white text-xl"></i>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-900">All Tasks</h3>
                        </div>
                        <div class="flex items-center space-x-3">
                            <select id="filterStatus" class="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="all">All Tasks</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                            </select>
                            <button id="refreshTasks" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm transition-colors duration-200">
                                <i class="fas fa-sync-alt mr-2"></i>Refresh
                            </button>
                        </div>
                    </div>
                    <div id="allTasks" class="space-y-4">
                        <!-- Tasks will be loaded here -->
                        <div class="text-center py-12 text-gray-500">
                            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
                            </div>
                            <p class="text-lg">Loading tasks...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script>
        // Load tasks on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadTasks();
            
            // Add event listeners
            document.getElementById('filterStatus').addEventListener('change', function() {
                loadTasks();
            });
            
            document.getElementById('refreshTasks').addEventListener('click', function() {
                loadTasks();
            });
        });

        // Handle task form submission
        document.getElementById('taskForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const taskData = {
                title: formData.get('title'),
                due_date: formData.get('due_date'),
                due_time: formData.get('due_time'),
                description: formData.get('description'),
                user_id: 'web-user-' + Date.now()
            };
            createTask(taskData);
        });

        // Create task
        async function createTask(taskData) {
            try {
                const response = await axios.post('http://localhost:8002/api/todos', taskData);
                if (response.data.success) {
                    document.getElementById('taskForm').reset();
                    loadTasks();
                    showNotification('Task created successfully!', 'success');
                }
            } catch (error) {
                console.error('Error creating task:', error);
                showNotification('Error creating task. Please try again.', 'error');
            }
        }

        // Load all tasks
        async function loadTasks() {
            try {
                const response = await axios.get('http://localhost:8002/api/todos');
                if (response.data.success) {
                    displayAllTasks(response.data.data);
                    updateStats(response.data.data);
                }
            } catch (error) {
                console.error('Error loading tasks:', error);
                document.getElementById('allTasks').innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-exclamation-triangle text-2xl text-red-500"></i>
                        </div>
                        <p class="text-lg text-red-600 font-medium">Error loading tasks</p>
                        <p class="text-sm text-gray-500">Please try refreshing the page</p>
                    </div>
                `;
            }
        }

        // Display all tasks with filtering
        function displayAllTasks(todos) {
            const allTasks = document.getElementById('allTasks');
            const filterStatus = document.getElementById('filterStatus').value;
            
            if (!todos || Object.keys(todos).length === 0) {
                allTasks.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-clipboard-list text-3xl text-gray-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-500 mb-2">No tasks yet</h3>
                        <p class="text-gray-400">Create your first task to get started!</p>
                    </div>
                `;
                return;
            }

            const tasksArray = Object.entries(todos);
            let filteredTasks = tasksArray;

            // Apply filtering
            if (filterStatus !== 'all') {
                filteredTasks = tasksArray.filter(([id, todo]) => {
                    const isCompleted = todo.completed;
                    const dueDate = todo.due_date;
                    const isOverdue = dueDate && new Date(dueDate + (todo.due_time ? 'T' + todo.due_time : '')) < new Date() && !isCompleted;
                    
                    switch (filterStatus) {
                        case 'pending':
                            return !isCompleted && !isOverdue;
                        case 'completed':
                            return isCompleted;
                        case 'overdue':
                            return isOverdue;
                        default:
                            return true;
                    }
                });
            }

            if (filteredTasks.length === 0) {
                allTasks.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-filter text-3xl text-gray-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-500 mb-2">No tasks found</h3>
                        <p class="text-gray-400">Try adjusting your filter or create a new task</p>
                    </div>
                `;
                return;
            }

            const tasksHtml = filteredTasks.map(([id, todo]) => {
                const isCompleted = todo.completed;
                const dueDate = todo.due_date;
                const dueTime = todo.due_time;
                const isOverdue = dueDate && new Date(dueDate + (dueTime ? 'T' + dueTime : '')) < new Date() && !isCompleted;
                
                return `
                    <div class="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${isCompleted ? 'border-l-green-500 bg-green-50/50' : isOverdue ? 'border-l-red-500 bg-red-50/50' : 'border-l-blue-500'} ${isCompleted ? 'opacity-75' : ''}">
                        <div class="p-6">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4 flex-1">
                                    <button onclick="toggleTask('${id}')" 
                                            class="w-6 h-6 rounded-full border-2 ${isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex items-center justify-center transition-all duration-200 hover:scale-110">
                                        ${isCompleted ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                                    </button>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}">${todo.title}</h4>
                                        ${todo.description ? `<p class="text-sm text-gray-600 mt-1">${todo.description}</p>` : ''}
                                        ${dueDate ? `<p class="text-sm ${isOverdue && !isCompleted ? 'text-red-600 font-medium' : 'text-gray-500'} mt-2">
                                            <i class="fas fa-calendar mr-1"></i>Due: ${formatDateTime(dueDate, dueTime)}
                                        </p>` : ''}
                                    </div>
                                </div>
                                <div class="flex items-center space-x-3">
                                    ${isCompleted ? '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Completed</span>' : ''}
                                    ${isOverdue ? '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Overdue</span>' : ''}
                                    <button onclick="deleteTask('${id}')" class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            allTasks.innerHTML = tasksHtml;
        }

        // Update statistics
        function updateStats(todos) {
            if (!todos || Object.keys(todos).length === 0) {
                document.getElementById('totalTasks').textContent = '0';
                document.getElementById('completedTasks').textContent = '0';
                document.getElementById('pendingTasks').textContent = '0';
                return;
            }

            const total = Object.keys(todos).length;
            const completed = Object.values(todos).filter(todo => todo.completed).length;
            const pending = total - completed;

            document.getElementById('totalTasks').textContent = total;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('pendingTasks').textContent = pending;
        }

        // Toggle task completion
        async function toggleTask(id) {
            try {
                const response = await axios.patch(`http://localhost:8002/api/todos/${id}/toggle`);
                if (response.data.success) {
                    loadTasks();
                    showNotification('Task updated successfully!', 'success');
                }
            } catch (error) {
                console.error('Error toggling task:', error);
                showNotification('Error updating task. Please try again.', 'error');
            }
        }

        // Delete task
        async function deleteTask(id) {
            if (!confirm('Are you sure you want to delete this task?')) {
                return;
            }
            try {
                const response = await axios.delete(`http://localhost:8002/api/todos/${id}`);
                if (response.data.success) {
                    loadTasks();
                    showNotification('Task deleted successfully!', 'success');
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                showNotification('Error deleting task. Please try again.', 'error');
            }
        }

        // Format date and time for display
        function formatDateTime(dateString, timeString) {
            const date = new Date(dateString + (timeString ? 'T' + timeString : ''));
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let dateDisplay = '';
            if (diffDays === 1) dateDisplay = 'Today';
            else if (diffDays === 2) dateDisplay = 'Tomorrow';
            else if (diffDays <= 7) dateDisplay = `${diffDays - 1} days from now`;
            else dateDisplay = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            if (timeString) {
                const time = new Date('2000-01-01T' + timeString);
                const timeDisplay = time.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                return `${dateDisplay} at ${timeDisplay}`;
            }
            
            return dateDisplay;
        }

        // Show notification
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg z-50 transition-all duration-300 transform translate-x-full ${
                type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`;
            notification.innerHTML = `
                <div class="flex items-center space-x-2">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 100);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
    </script>
</x-app-layout>
