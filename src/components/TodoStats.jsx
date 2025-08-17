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
    dueDateBreakdown: { overdue: 0, dueToday: 0, dueTomorrow: 0, dueLater: 0, noDueDate: 0 },
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
            updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
            dueDateTime: doc.data().dueDateTime ? new Date(doc.data().dueDateTime) : null
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

        // Due date breakdown
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueDateBreakdown = {
          overdue: todos.filter(todo => 
            !todo.completed && 
            todo.dueDateTime && 
            new Date(todo.dueDateTime) < now
          ).length,
          dueToday: todos.filter(todo => 
            !todo.completed && 
            todo.dueDateTime && 
            new Date(todo.dueDateTime).toDateString() === now.toDateString()
          ).length,
          dueTomorrow: todos.filter(todo => 
            !todo.completed && 
            todo.dueDateTime && 
            new Date(todo.dueDateTime).toDateString() === tomorrow.toDateString()
          ).length,
          dueLater: todos.filter(todo => 
            !todo.completed && 
            todo.dueDateTime && 
            new Date(todo.dueDateTime) > tomorrow
          ).length,
          noDueDate: todos.filter(todo => !todo.dueDateTime).length
        };

        // Recent activity (last 5 todos)
        const recentActivity = todos.slice(0, 5);

        setStats({
          total,
          completed,
          active,
          completionRate,
          priorityBreakdown,
          dueDateBreakdown,
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

      {/* Due Date Breakdown */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Due Date Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-red-100 p-4 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold text-red-800">Overdue</h4>
            <p className="text-2xl font-bold text-red-600">{stats.dueDateBreakdown.overdue}</p>
            <p className="text-xs text-red-600">Past due date</p>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-800">Due Today</h4>
            <p className="text-2xl font-bold text-orange-600">{stats.dueDateBreakdown.dueToday}</p>
            <p className="text-xs text-orange-600">Must complete today</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800">Due Tomorrow</h4>
            <p className="text-2xl font-bold text-blue-600">{stats.dueDateBreakdown.dueTomorrow}</p>
            <p className="text-xs text-blue-600">Coming up soon</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800">Due Later</h4>
            <p className="text-2xl font-bold text-green-600">{stats.dueDateBreakdown.dueLater}</p>
            <p className="text-xs text-green-600">Future deadlines</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-500">
            <h4 className="font-semibold text-gray-800">No Due Date</h4>
            <p className="text-2xl font-bold text-gray-600">{stats.dueDateBreakdown.noDueDate}</p>
            <p className="text-xs text-gray-600">Flexible timing</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Activity</h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((todo) => {
              const getDueDateStatus = (dueDateTime) => {
                if (!dueDateTime) return { text: 'No due date', color: 'text-gray-500' };
                
                const now = new Date();
                const dueDate = new Date(dueDateTime);
                const isPast = dueDate < now;
                const isToday = dueDate.toDateString() === now.toDateString();
                const isTomorrow = dueDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
                
                if (isPast) return { text: 'Overdue', color: 'text-red-600' };
                if (isToday) return { text: 'Due today', color: 'text-orange-600' };
                if (isTomorrow) return { text: 'Due tomorrow', color: 'text-blue-600' };
                return { text: 'Due later', color: 'text-green-600' };
              };

              const dueDateStatus = getDueDateStatus(todo.dueDateTime);
              
              return (
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
                      <div className="flex items-center space-x-2 mt-2">
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
                        <span className={`text-xs ${dueDateStatus.color}`}>
                          {dueDateStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
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
