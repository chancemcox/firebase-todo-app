const OAuth2Server = require('express-oauth-server');
const { db } = require('./firebase-server');
const { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');

// OAuth2 Server configuration
const oauth = new OAuth2Server({
  model: {
    // Get client
    getClient: async (clientId, clientSecret) => {
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
    },

    // Save token
    saveToken: async (token, client, user) => {
      try {
        console.log('Saving token for client:', client.clientId, 'user:', user.id);
        
        const tokenData = {
          accessToken: token.accessToken,
          accessTokenExpiresAt: token.accessTokenExpiresAt,
          clientId: client.clientId,
          userId: user.id,
          scope: token.scope,
          createdAt: new Date().toISOString()
        };

        if (token.refreshToken) {
          tokenData.refreshToken = token.refreshToken;
          tokenData.refreshTokenExpiresAt = token.refreshTokenExpiresAt;
        }

        await addDoc(collection(db, 'oauth_tokens'), tokenData);
        console.log('Token saved successfully');
        return token;
      } catch (error) {
        console.error('Error saving OAuth token:', error);
        return false;
      }
    },

    // Get access token
    getAccessToken: async (accessToken) => {
      try {
        console.log('Getting access token:', accessToken);
        
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
        
        console.log('Access token found and valid');
        return {
          accessToken: token.accessToken,
          accessTokenExpiresAt: token.accessTokenExpiresAt,
          clientId: token.clientId,
          userId: token.userId,
          scope: token.scope
        };
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    },

    // Get refresh token
    getRefreshToken: async (refreshToken) => {
      try {
        console.log('Getting refresh token:', refreshToken);
        
        const tokensRef = collection(db, 'oauth_tokens');
        const q = query(tokensRef, where('refreshToken', '==', refreshToken));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log('Refresh token not found');
          return null;
        }
        
        const token = snapshot.docs[0].data();
        
        // Check if refresh token is expired
        if (token.refreshTokenExpiresAt && new Date(token.refreshTokenExpiresAt) < new Date()) {
          console.log('Refresh token expired');
          return null;
        }
        
        console.log('Refresh token found and valid');
        return {
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: token.refreshTokenExpiresAt,
          clientId: token.clientId,
          userId: token.userId,
          scope: token.scope
        };
      } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
      }
    },

    // Revoke token
    revokeToken: async (token) => {
      try {
        console.log('Revoking token:', token.refreshToken);
        
        const tokensRef = collection(db, 'oauth_tokens');
        const q = query(tokensRef, where('refreshToken', '==', token.refreshToken));
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
    },

    // Validate scope
    validateScope: async (user, client, scope) => {
      console.log('Validating scope:', scope, 'for user:', user.id, 'client:', client.clientId);
      // For now, accept all scopes
      return scope;
    },

    // Get user
    getUser: async (username, password) => {
      console.log('Getting user:', username);
      // For now, return a mock user
      // In production, you should validate against Firebase Auth
      return {
        id: username,
        email: username
      };
    }
  },
  
  accessTokenLifetime: 3600, // 1 hour
  refreshTokenLifetime: 1209600, // 14 days
  allowBearerTokensInQueryString: false
});

module.exports = oauth;
