<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskFlow - Smart Todo Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
    <!-- Navigation Bar -->
    <nav class="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <i class="fas fa-tasks text-white text-sm"></i>
                        </div>
                        <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TaskFlow</span>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    @auth
                        <span class="text-gray-700 font-medium">Welcome, {{ Auth::user()->name }}!</span>
                        <a href="{{ route('dashboard') }}" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            <i class="fas fa-chart-line mr-2"></i>Dashboard
                        </a>
                        <form method="POST" action="{{ route('logout') }}" class="inline">
                            @csrf
                            <button type="submit" class="text-gray-600 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200 text-sm font-medium">
                                <i class="fas fa-sign-out-alt mr-2"></i>Logout
                            </button>
                        </form>
                    @else
                        <a href="{{ route('login') }}" class="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium">
                            <i class="fas fa-sign-in-alt mr-2"></i>Login
                        </a>
                        <a href="{{ route('register') }}" class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            <i class="fas fa-user-plus mr-2"></i>Get Started
                        </a>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <!-- Background decorative elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
    </div>

    <div class="container mx-auto px-4 py-16 relative z-10">
        <div class="text-center">
            <div class="mb-12">
                <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8 shadow-2xl animate-bounce">
                    <i class="fas fa-rocket text-white text-4xl"></i>
                </div>
                <h1 class="text-6xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 leading-tight">
                    Organize Your Life
                </h1>
                <p class="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                    TaskFlow is your intelligent companion for managing tasks, projects, and goals. 
                    Built with modern web technologies for seamless productivity.
                </p>
            
                <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
                    @auth
                        <a href="{{ route('dashboard') }}" 
                           class="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                            <i class="fas fa-chart-line mr-3 group-hover:scale-110 transition-transform duration-300"></i>
                            Go to Dashboard
                        </a>
                        <a href="{{ route('dashboard') }}" 
                           class="group bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 font-semibold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50">
                            <i class="fas fa-tasks mr-3 group-hover:scale-110 transition-transform duration-300"></i>
                            Manage Tasks
                        </a>
                    @else
                        <a href="{{ route('login') }}" 
                           class="group bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 font-semibold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200/50">
                            <i class="fas fa-sign-in-alt mr-3 group-hover:scale-110 transition-transform duration-300"></i>
                            Sign In
                        </a>
                        <a href="{{ route('register') }}" 
                           class="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                            <i class="fas fa-rocket mr-3 group-hover:scale-110 transition-transform duration-300"></i>
                            Get Started Free
                        </a>
                    @endauth
                </div>
                
                @auth
                    <div class="mt-20 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg mx-auto border border-gray-200/50 transform hover:scale-105 transition-all duration-300">
                        <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6 mx-auto shadow-lg">
                            <i class="fas fa-user-check text-white text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Welcome back, {{ Auth::user()->name }}! 👋</h3>
                        <p class="text-gray-600 text-center mb-6">You're all set to boost your productivity. Head to your dashboard to start managing tasks!</p>
                        <div class="text-center">
                            <a href="{{ route('dashboard') }}" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                <i class="fas fa-arrow-right mr-2"></i>Go to Dashboard
                            </a>
                        </div>
                    </div>
                @else
                    <div class="mt-20 p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg mx-auto border border-gray-200/50 transform hover:scale-105 transition-all duration-300">
                        <div class="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 mx-auto shadow-lg">
                            <i class="fas fa-rocket text-white text-3xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-4 text-center">Ready to get organized? 🚀</h3>
                        <p class="text-gray-600 text-center mb-6">Join thousands of users who are already boosting their productivity with TaskFlow.</p>
                        <div class="text-center">
                            <a href="{{ route('register') }}" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                <i class="fas fa-user-plus mr-2"></i>Create Free Account
                            </a>
                        </div>
                    </div>
                @endauth
            </div>

            <!-- Feature Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200/50">
                    <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <i class="fas fa-tasks text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">Smart Task Management</h3>
                    <p class="text-gray-600 text-center leading-relaxed">Organize tasks with due dates, priorities, and descriptions. Never miss a deadline again.</p>
                </div>

                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200/50">
                    <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <i class="fas fa-chart-line text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">Progress Tracking</h3>
                    <p class="text-gray-600 text-center leading-relaxed">Monitor your productivity with real-time statistics and completion tracking.</p>
                </div>

                <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-200/50">
                    <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <i class="fas fa-mobile-alt text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">Responsive Design</h3>
                    <p class="text-gray-600 text-center leading-relaxed">Access your tasks from anywhere with our mobile-friendly, responsive interface.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
