import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Set up real-time listener for user profile
      const userRef = doc(db, 'users', currentUser.uid);
      
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setProfile(userData);
          setNewDisplayName(userData.displayName || '');
        } else {
          // Create user profile if it doesn't exist
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            createdAt: new Date().toISOString(),
            photoURL: currentUser.photoURL
          });
        }
        setLoading(false);
      }, (error) => {
        console.error('Error listening to user profile:', error);
        setError('Failed to load profile');
        setLoading(false);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up profile listener:', error);
      setError('Failed to set up profile updates');
      setLoading(false);
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!newDisplayName.trim()) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: newDisplayName.trim(),
        updatedAt: new Date().toISOString()
      });
      
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasValidPhoto = (photoURL) => {
    return photoURL && photoURL.trim() !== '' && photoURL !== 'null';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">User Profile</h2>
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

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-600">
          <h2 className="text-2xl font-bold mb-4">User Profile</h2>
          <p className="text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-green-600 font-medium">Live Updates</span>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          {hasValidPhoto(profile.photoURL) ? (
            <img
              src={profile.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-24 h-24 rounded-full border-4 border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 ${
              hasValidPhoto(profile.photoURL) ? 'hidden' : 'flex'
            }`}
          >
            {getUserInitials(profile.displayName || profile.email)}
          </div>
        </div>
        
        <div className="flex-1">
          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                placeholder="Enter display name"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !newDisplayName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setNewDisplayName(profile.displayName || '');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {profile.displayName || 'No Display Name'}
              </h3>
              <p className="text-gray-600 mb-3">{profile.email}</p>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
            <p className="text-sm text-gray-800 font-mono bg-white px-3 py-2 rounded border">
              {profile.uid}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <p className="text-sm text-gray-800 bg-white px-3 py-2 rounded border">
              {profile.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Display Name</label>
            <p className="text-sm text-gray-800 bg-white px-3 py-2 rounded border">
              {profile.displayName || 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Photo URL</label>
            <p className="text-sm text-gray-800 bg-white px-3 py-2 rounded border">
              {hasValidPhoto(profile.photoURL) ? 'Set' : 'Not set'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
            <p className="text-sm text-gray-800 bg-white px-3 py-2 rounded border">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
            <p className="text-sm text-gray-800 bg-white px-3 py-2 rounded border">
              {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Authentication Status */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Authentication Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">Email Verified</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              currentUser?.emailVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {currentUser?.emailVerified ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-700">Provider</span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {currentUser?.providerData?.[0]?.providerId || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-700">Last Sign In</span>
            <span className="text-sm text-blue-600">
              {currentUser?.metadata?.lastSignInTime 
                ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() 
                : 'Unknown'}
            </span>
          </div>
        </div>
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

export default UserProfile;
