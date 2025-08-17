import React from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';

const TodoStats = () => {
  const todos = useSelector((state) => state.todos.todos);
  const { currentUser } = useAuth();

  // Filter todos for current user
  const userTodos = todos.filter(todo => todo.userId === currentUser?.uid);
  
  // Calculate statistics
  const totalTodos = userTodos.length;
  const completedTodos = userTodos.filter(todo => todo.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
  
  // Priority breakdown
  const priorityStats = userTodos.reduce((acc, todo) => {
    const priority = todo.priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  
  // Recent activity (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const recentTodos = userTodos.filter(todo => 
    new Date(todo.createdAt) >= lastWeek
  ).length;

  const stats = [
    {
      label: 'Total Todos',
      value: totalTodos,
      icon: '📝',
      color: 'bg-blue-500'
    },
    {
      label: 'Completed',
      value: completedTodos,
      icon: '✅',
      color: 'bg-green-500'
    },
    {
      label: 'Active',
      value: activeTodos,
      icon: '⏳',
      color: 'bg-yellow-500'
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: '📊',
      color: 'bg-purple-500'
    }
  ];

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-full text-white text-2xl`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Breakdown */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Priority Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(priorityStats).map(([priority, count]) => (
            <div key={priority} className="text-center p-4 rounded-lg bg-gray-50">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${priorityColors[priority]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">todos</p>
            </div>
          ))}
        </div>
        {Object.keys(priorityStats).length === 0 && (
          <p className="text-center text-gray-500 py-4">No todos yet. Create your first one!</p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-blue-500 text-xl">🆕</span>
              <div>
                <p className="font-medium text-gray-800">New Todos This Week</p>
                <p className="text-sm text-gray-600">Created in the last 7 days</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{recentTodos}</span>
          </div>
          
          {totalTodos > 0 && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-xl">🎯</span>
                <div>
                  <p className="font-medium text-gray-800">Progress Goal</p>
                  <p className="text-sm text-gray-600">Target: 80% completion</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${
                  completionRate >= 80 ? 'text-green-600' : 
                  completionRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {completionRate}%
                </span>
                <p className="text-xs text-gray-500">
                  {completionRate >= 80 ? '🎉 Great job!' : 
                   completionRate >= 60 ? '👍 Keep going!' : '💪 You can do it!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <div className="text-center">
              <span className="text-2xl">➕</span>
              <p className="font-medium">Add New Todo</p>
              <p className="text-sm">Create a new task</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors">
            <div className="text-center">
              <span className="text-2xl">📋</span>
              <p className="font-medium">View All Todos</p>
              <p className="text-sm">See your complete list</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoStats;
