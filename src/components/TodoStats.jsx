import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const TodoStats = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    completionRate: 0,
    priorityBreakdown: { low: 0, medium: 0, high: 0 },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Create real-time listener for todos
      const todosRef = collection(db, 'todos');
      const q = query(
        todosRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const todos = [];
        snapshot.forEach((doc) => {
          todos.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
          });
        });

        // Calculate real-time statistics
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const active = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Priority breakdown
        const priorityBreakdown = {
          low: todos.filter(todo => todo.priority === 'low').length,
          medium: todos.filter(todo => todo.priority === 'medium').length,
          high: todos.filter(todo => todo.priority === 'high').length
        };

        // Recent activity (last 5 todos)
        const recentActivity = todos.slice(0, 5);

        setStats({
          total,
          completed,
          active,
          completionRate,
          priorityBreakdown,
          recentActivity
        });

        setLoading(false);
      }, (error) => {
        console.error('Error listening to todos:', error);
        setError('Failed to load real-time statistics');
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      setError('Failed to set up real-time updates');
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Statistics</h2>
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Real-Time Statistics</h2>
      
      {/* Live indicator */}
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
        <span className="text-sm text-green-600 font-medium">Live Updates Active</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Todos</h3>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Active</h3>
          <p className="text-3xl font-bold">{stats.active}</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Completion Rate</h3>
        <div className="bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>0%</span>
          <span className="font-semibold">{stats.completionRate}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Priority Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-800">High Priority</h4>
            <p className="text-2xl font-bold text-red-600">{stats.priorityBreakdown.high}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-800">Medium Priority</h4>
            <p className="text-2xl font-bold text-yellow-600">{stats.priorityBreakdown.medium}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800">Low Priority</h4>
            <p className="text-2xl font-bold text-green-600">{stats.priorityBreakdown.low}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((todo) => (
              <div 
                key={todo.id} 
                className={`p-4 rounded-lg border-l-4 transition-all duration-300 ${
                  todo.completed 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      todo.completed ? 'text-green-800 line-through' : 'text-blue-800'
                    }`}>
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className={`text-sm mt-1 ${
                        todo.completed ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {todo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                      todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {todo.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      todo.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {todo.completed ? 'Completed' : 'Active'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No todos yet. Create your first todo to see activity here!</p>
          </div>
        )}
      </div>

      {/* Real-time status */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Connected to Firestore</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoStats;
