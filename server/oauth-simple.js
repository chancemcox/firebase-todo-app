const crypto = require('crypto');
const { db } = require('./firebase-server');
const { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');

// Simple OAuth implementation
class SimpleOAuth {
  constructor() {
    this.accessTokenLifetime = 3600; // 1 hour
    this.refreshTokenLifetime = 1209600; // 14 days
  }

  // Generate random tokens
  generateAccessToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateRefreshToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Get client
  async getClient(clientId, clientSecret) {
    try {
      console.log('Getting client:', clientId, clientSecret ? 'with secret' : 'without secret');
      
      const clientsRef = collection(db, 'oauth_clients');
      const q = query(clientsRef, where('clientId', '==', clientId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('Client not found:', clientId);
        return null;
      }
      
      const client = snapshot.docs[0].data();
      console.log('Found client:', client.name);
      
      // If clientSecret is provided, verify it
      if (clientSecret && client.clientSecret !== clientSecret) {
        console.log('Client secret mismatch');
        return null;
      }
      
      return {
        id: client.clientId,
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        grants: client.grants || ['password', 'refresh_token'],
        redirectUris: client.redirectUris || []
      };
    } catch (error) {
      console.error('Error getting OAuth client:', error);
      return null;
    }
  }

  // Get user (mock implementation)
  async getUser(username, password) {
    console.log('Getting user:', username);
    // For now, return a mock user
    // In production, you should validate against Firebase Auth
    return {
      id: username,
      email: username
    };
  }

  // Generate token
  async generateToken(clientId, username, scope = 'read write') {
    try {
      console.log('Generating token for client:', clientId, 'user:', username);
      
      const accessToken = this.generateAccessToken();
      const refreshToken = this.generateRefreshToken();
      
      const now = new Date();
      const accessTokenExpiresAt = new Date(now.getTime() + this.accessTokenLifetime * 1000);
      const refreshTokenExpiresAt = new Date(now.getTime() + this.refreshTokenLifetime * 1000);
      
      const tokenData = {
        accessToken,
        accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
        refreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
        clientId,
        userId: username,
        scope,
        createdAt: now.toISOString()
      };

      await addDoc(collection(db, 'oauth_tokens'), tokenData);
      console.log('Token saved successfully');
      
      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: this.accessTokenLifetime,
        refresh_token: refreshToken,
        scope
      };
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  // Validate access token
  async validateAccessToken(accessToken) {
    try {
      console.log('Validating access token:', accessToken);
      
      const tokensRef = collection(db, 'oauth_tokens');
      const q = query(tokensRef, where('accessToken', '==', accessToken));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('Access token not found');
        return null;
      }
      
      const token = snapshot.docs[0].data();
      
      // Check if token is expired
      if (token.accessTokenExpiresAt && new Date(token.accessTokenExpiresAt) < new Date()) {
        console.log('Access token expired');
        return null;
      }
      
      console.log('Access token valid for user:', token.userId);
      return {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: token.clientId,
        userId: token.userId,
        scope: token.scope
      };
    } catch (error) {
      console.error('Error validating access token:', error);
      return null;
    }
  }

  // Revoke token
  async revokeToken(token) {
    try {
      console.log('Revoking token:', token);
      
      const tokensRef = collection(db, 'oauth_tokens');
      const q = query(tokensRef, where('accessToken', '==', token));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const tokenDoc = snapshot.docs[0];
        await deleteDoc(doc(db, 'oauth_tokens', tokenDoc.id));
        console.log('Token revoked successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }
}

module.exports = new SimpleOAuth();
