const express = require('express');
const { db } = require('../firebase-server');
const { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');
const oauth = require('../oauth-simple');

const router = express.Router();

// Middleware to authenticate OAuth tokens
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    // Validate the access token
    const tokenData = await oauth.validateAccessToken(token);
    if (!tokenData) {
      return res.status(401).json({ error: 'Invalid or expired access token' });
    }
    
    // Add user info to request
    req.user = {
      userId: tokenData.userId,
      clientId: tokenData.clientId,
      scope: tokenData.scope
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// GET /api/todos - Get all todos for authenticated user
/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos for authenticated user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, active, completed]
 *         description: Filter todos by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter todos by priority
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of todos to return
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 todos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Invalid or missing access token
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { filter, priority, limit = 50 } = req.query;
    const userId = req.user.userId;
    
    let q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    // Apply filters
    if (filter === 'active') {
      q = query(q, where('completed', '==', false));
    } else if (filter === 'completed') {
      q = query(q, where('completed', '==', true));
    }
    
    if (priority) {
      q = query(q, where('priority', '==', priority));
    }
    
    const snapshot = await getDocs(q);
    let todos = [];
    
    snapshot.forEach((doc) => {
      todos.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      });
    });
    
    // Apply limit
    if (limit) {
      todos = todos.slice(0, parseInt(limit));
    }
    
    res.json({
      todos,
      total: todos.length,
      filter,
      priority,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// GET /api/todos/:id - Get a specific todo
/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a specific todo by ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const todoDoc = await getDoc(doc(db, 'todos', id));
    
    if (!todoDoc.exists()) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoDoc.data();
    
    // Check if user owns this todo
    if (todo.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({
      id: todoDoc.id,
      ...todo,
      createdAt: todo.createdAt?.toDate?.() || new Date(),
      updatedAt: todo.updatedAt?.toDate?.() || new Date()
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// POST /api/todos - Create a new todo
/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Todo title
 *               description:
 *                 type: string
 *                 description: Todo description
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tags
 *     responses:
 *       201:
 *         description: Todo created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, priority = 'medium', tags = [] } = req.body;
    const userId = req.user.userId;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const todoData = {
      title: title.trim(),
      description: description?.trim() || '',
      priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()) : [],
      completed: false,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const todoRef = await addDoc(collection(db, 'todos'), todoData);
    
    res.status(201).json({
      id: todoRef.id,
      ...todoData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /api/todos/:id - Update a todo
/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;
    
    // Validate updates
    const allowedFields = ['title', 'description', 'priority', 'tags', 'completed'];
    const validUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'title' && updates[key]) {
          validUpdates[key] = updates[key].trim();
        } else if (key === 'priority' && ['low', 'medium', 'high'].includes(updates[key])) {
          validUpdates[key] = updates[key];
        } else if (key === 'tags' && Array.isArray(updates[key])) {
          validUpdates[key] = updates[key].filter(tag => tag && tag.trim());
        } else if (key === 'completed' && typeof updates[key] === 'boolean') {
          validUpdates[key] = updates[key];
        } else if (key === 'description') {
          validUpdates[key] = updates[key]?.trim() || '';
        }
      }
    });
    
    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }
    
    validUpdates.updatedAt = serverTimestamp();
    
    const todoRef = doc(db, 'todos', id);
    const todoDoc = await getDoc(todoRef);
    
    if (!todoDoc.exists()) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoDoc.data();
    
    if (todo.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await updateDoc(todoRef, validUpdates);
    
    res.json({
      id,
      ...todo,
      ...validUpdates,
      createdAt: todo.createdAt?.toDate?.() || new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /api/todos/:id - Delete a todo
/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const todoRef = doc(db, 'todos', id);
    const todoDoc = await getDoc(todoRef);
    
    if (!todoDoc.exists()) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoDoc.data();
    
    if (todo.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await deleteDoc(todoRef);
    
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// PATCH /api/todos/:id/toggle - Toggle todo completion
/**
 * @swagger
 * /api/todos/{id}/toggle:
 *   patch:
 *     summary: Toggle todo completion status
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo completion status toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Todo not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const todoRef = doc(db, 'todos', id);
    const todoDoc = await getDoc(todoRef);
    
    if (!todoDoc.exists()) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const todo = todoDoc.data();
    
    if (todo.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const newCompletedStatus = !todo.completed;
    
    await updateDoc(todoRef, {
      completed: newCompletedStatus,
      updatedAt: serverTimestamp()
    });
    
    res.json({
      id,
      ...todo,
      completed: newCompletedStatus,
      createdAt: todo.createdAt?.toDate?.() || new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

module.exports = router;
