import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const UserProfile = () => {
  const { currentUser, getUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile(currentUser.uid);
      if (userProfile) {
        setProfile(userProfile);
        setDisplayName(userProfile.displayName || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      setMessage('Display name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Update Firebase Auth profile
      await updateProfile(currentUser, { displayName: displayName.trim() });

      // Update Firestore user document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        updatedAt: new Date().toISOString()
      });

      // Reload profile
      await loadProfile();
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Check if user has a valid photo URL
  const hasValidPhoto = currentUser?.photoURL && 
    currentUser.photoURL !== 'null' && 
    currentUser.photoURL !== 'undefined' &&
    currentUser.photoURL.trim() !== '';

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">User Profile</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.includes('successfully') 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          {hasValidPhoto ? (
            <img
              src={currentUser.photoURL}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          <div 
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              hasValidPhoto ? 'hidden' : 'flex'
            } bg-gradient-to-br from-blue-500 to-purple-600 text-white`}
          >
            {getUserInitials()}
          </div>
          
          <div>
            <h4 className="text-lg font-medium text-gray-800">
              {currentUser.displayName || 'No display name'}
            </h4>
            <p className="text-gray-600">{currentUser.email}</p>
            <p className="text-sm text-gray-500">
              Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter display name"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Save Changes'}
              </button>
              
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDisplayName(profile?.displayName || '');
                  setMessage('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-200">
            <h5 className="font-medium text-gray-800 mb-2">Account Information</h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User ID:</strong> {currentUser.uid}</p>
              <p><strong>Email Verified:</strong> {currentUser.emailVerified ? 'Yes' : 'No'}</p>
              <p><strong>Provider:</strong> {currentUser.providerData[0]?.providerId || 'Email/Password'}</p>
              <p><strong>Photo URL:</strong> {hasValidPhoto ? 'Set' : 'Not set'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
