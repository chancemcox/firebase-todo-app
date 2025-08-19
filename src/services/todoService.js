import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Create a new todo
export const createTodo = async (todoData, userId) => {
  try {
    console.log('Creating todo with data:', { todoData, userId });
    console.log('Firestore db instance:', db);
    
    const todoRef = await addDoc(collection(db, 'todos'), {
      ...todoData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completed: false
    });
    
    console.log('Todo created successfully with ID:', todoRef.id);
    return { id: todoRef.id, ...todoData };
  } catch (error) {
    console.error('Error creating todo:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Get todos for a specific user
export const getUserTodos = async (userId) => {
  try {
    console.log('Fetching todos for user:', userId);
    
    // Fetch user todos and sort client-side to avoid composite index requirement
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const todos = [];
    
    querySnapshot.forEach((doc) => {
      todos.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      });
    });
    
    // Sort by createdAt desc on client
    const sorted = todos.sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
    console.log('Fetched todos:', sorted);
    return sorted;
  } catch (error) {
    console.error('Error getting user todos:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Update a todo
export const updateTodo = async (todoId, updates) => {
  try {
    console.log('Updating todo:', { todoId, updates });
    
    const todoRef = doc(db, 'todos', todoId);
    await updateDoc(todoRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('Todo updated successfully');
    return { id: todoId, ...updates };
  } catch (error) {
    console.error('Error updating todo:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (todoId) => {
  try {
    console.log('Deleting todo:', todoId);
    
    await deleteDoc(doc(db, 'todos', todoId));
    
    console.log('Todo deleted successfully');
    return todoId;
  } catch (error) {
    console.error('Error deleting todo:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Toggle todo completion
export const toggleTodoCompletion = async (todoId, completed) => {
  try {
    console.log('Toggling todo completion:', { todoId, completed });
    
    const todoRef = doc(db, 'todos', todoId);
    await updateDoc(todoRef, {
      completed: !completed,
      updatedAt: serverTimestamp()
    });
    
    console.log('Todo completion toggled successfully');
    return { id: todoId, completed: !completed };
  } catch (error) {
    console.error('Error toggling todo completion:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};
