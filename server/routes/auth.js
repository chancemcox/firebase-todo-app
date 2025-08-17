const express = require('express');
const { db } = require('../firebase-server');
const { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const oauth = require('../oauth-simple');

const router = express.Router();

// POST /api/auth/token - Get access token (OAuth2 password grant)
/**
 * @swagger
 * /api/auth/token:
 *   post:
 *     summary: Get OAuth2 access token using password grant
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - grant_type
 *               - client_id
 *               - client_secret
 *               - username
 *               - password
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [password]
 *                 description: OAuth2 grant type
 *               client_id:
 *                 type: string
 *                 description: OAuth client ID
 *               client_secret:
 *                 type: string
 *                 description: OAuth client secret
 *               username:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *               scope:
 *                 type: string
 *                 description: Requested scopes (optional)
 *     responses:
 *       200:
 *         description: Access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: OAuth2 access token
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 expires_in:
 *                   type: integer
 *                   description: Token expiration time in seconds
 *                 refresh_token:
 *                   type: string
 *                   description: OAuth2 refresh token
 *                 scope:
 *                   type: string
 *                   description: Granted scopes
 *       400:
 *         description: Bad request - Invalid parameters
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/token', async (req, res) => {
  try {
    const { grant_type, client_id, client_secret, username, password, scope } = req.body;
    
    // Validate required fields
    if (!grant_type || !client_id || !client_secret || !username || !password) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    if (grant_type !== 'password') {
      return res.status(400).json({ error: 'Only password grant type is supported' });
    }
    
    // Validate client
    const client = await oauth.getClient(client_id, client_secret);
    if (!client) {
      return res.status(401).json({ error: 'Invalid client credentials' });
    }
    
    // Validate user (mock implementation)
    const user = await oauth.getUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user credentials' });
    }
    
    // Generate token
    const token = await oauth.generateToken(client_id, username, scope);
    
    res.json(token);
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// POST /api/auth/clients - Create OAuth client
/**
 * @swagger
 * /api/auth/clients:
 *   post:
 *     summary: Create a new OAuth client
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - redirectUris
 *             properties:
 *               name:
 *                 type: string
 *                 description: Client application name
 *               redirectUris:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of redirect URIs
 *               grants:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [password, refresh_token, authorization_code]
 *                 description: Supported grant types
 *     responses:
 *       201:
 *         description: OAuth client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientId:
 *                   type: string
 *                   description: Generated client ID
 *                 clientSecret:
 *                   type: string
 *                   description: Generated client secret
 *                 name:
 *                   type: string
 *                   description: Client name
 *                 redirectUris:
 *                   type: array
 *                   items:
 *                     type: string
 *                 grants:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request - Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/clients', async (req, res) => {
  try {
    const { name, redirectUris = [], grants = ['password', 'refresh_token'] } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Client name is required' });
    }
    
    // Generate client ID and secret
    const clientId = 'client_' + Math.random().toString(36).substr(2, 9);
    const clientSecret = 'secret_' + Math.random().toString(36).substr(2, 15);
    
    const clientData = {
      name: name.trim(),
      clientId,
      clientSecret,
      redirectUris: Array.isArray(redirectUris) ? redirectUris : [],
      grants: Array.isArray(grants) ? grants : ['password', 'refresh_token'],
      createdAt: new Date().toISOString(),
      active: true
    };
    
    await addDoc(collection(db, 'oauth_clients'), clientData);
    
    res.status(201).json({
      clientId,
      clientSecret,
      name: clientData.name,
      redirectUris: clientData.redirectUris,
      grants: clientData.grants
    });
  } catch (error) {
    console.error('Error creating OAuth client:', error);
    res.status(500).json({ error: 'Failed to create OAuth client' });
  }
});

// GET /api/auth/clients - List OAuth clients
/**
 * @swagger
 * /api/auth/clients:
 *   get:
 *     summary: List all OAuth clients
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: List of OAuth clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       clientId:
 *                         type: string
 *                       redirectUris:
 *                         type: array
 *                         items:
 *                           type: string
 *                       grants:
 *                         type: array
 *                         items:
 *                           type: string
 *                       active:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/clients', async (req, res) => {
  try {
    const clientsRef = collection(db, 'oauth_clients');
    const snapshot = await getDocs(clientsRef);
    
    const clients = [];
    snapshot.forEach((doc) => {
      const client = doc.data();
      clients.push({
        id: doc.id,
        name: client.name,
        clientId: client.clientId,
        redirectUris: client.redirectUris,
        grants: client.grants,
        active: client.active,
        createdAt: client.createdAt
      });
    });
    
    res.json({ clients });
  } catch (error) {
    console.error('Error fetching OAuth clients:', error);
    res.status(500).json({ error: 'Failed to fetch OAuth clients' });
  }
});

// DELETE /api/auth/clients/:id - Delete OAuth client
/**
 * @swagger
 * /api/auth/clients/{id}:
 *   delete:
 *     summary: Delete an OAuth client
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: OAuth client deleted successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Internal server error
 */
router.delete('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const clientRef = doc(db, 'oauth_clients', id);
    const clientDoc = await getDoc(clientRef);
    
    if (!clientDoc.exists()) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    await deleteDoc(clientRef);
    
    res.json({ message: 'OAuth client deleted successfully' });
  } catch (error) {
    console.error('Error deleting OAuth client:', error);
    res.status(500).json({ error: 'Failed to delete OAuth client' });
  }
});

// POST /api/auth/revoke - Revoke access token
/**
 * @swagger
 * /api/auth/revoke:
 *   post:
 *     summary: Revoke an access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Access token or refresh token to revoke
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *       400:
 *         description: Bad request - Token required
 *       500:
 *         description: Internal server error
 */
router.post('/revoke', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Use the OAuth service to revoke the token
    await oauth.revokeToken(token);
    
    res.json({ message: 'Token revoked successfully' });
  } catch (error) {
    console.error('Error revoking token:', error);
    res.status(500).json({ error: 'Failed to revoke token' });
  }
});

module.exports = router;
