import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navigation = ({ activeSection, onSectionChange }) => {
  const { currentUser, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    console.log('Navigation: handleLogout called');
    try {
      await logout();
      console.log('Navigation: logout successful');
    } catch (error) {
      console.error('Navigation: logout error:', error);
    }
  };

  const toggleProfile = () => {
    console.log('Toggle profile clicked, current state:', showProfile);
    setShowProfile(!showProfile);
    console.log('New state will be:', !showProfile);
  };

  const sections = [
    { id: 'todos', label: 'My Todos', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'stats', label: 'Statistics', icon: '📊' }
  ];

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

  return (
    <div className="bg-white shadow-md rounded-lg mb-6">
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Todo App</h1>
          
          {/* Mobile Profile Button */}
          <div className="relative profile-container">
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {hasValidPhoto ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="profile-picture profile-picture-mobile"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              <div 
                className={`profile-picture profile-picture-mobile profile-initials ${
                  hasValidPhoto ? 'hidden' : 'flex'
                }`}
              >
                {getUserInitials()}
              </div>
              
              <span className="text-sm">▼</span>
            </button>

            {showProfile && (
              <div 
                className="absolute right-0 mt-2 mobile-profile-menu bg-white rounded-md shadow-lg border border-gray-200 z-50"
                ref={profileRef}
                style={{ minWidth: '200px' }}
              >
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                      {currentUser?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSectionChange('profile');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      onSectionChange('todos');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Todos
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <nav className="flex space-x-1 mobile-nav-tabs pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">Todo App</h1>
          
          {/* Desktop Navigation Tabs */}
          <nav className="flex space-x-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Desktop User Menu */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {currentUser?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500">{currentUser?.email}</p>
          </div>
          
          <div className="relative profile-container">
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {hasValidPhoto ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="profile-picture profile-picture-mobile"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              <div 
                className={`profile-picture profile-picture-mobile profile-initials ${
                  hasValidPhoto ? 'hidden' : 'flex'
                }`}
              >
                {getUserInitials()}
              </div>
              
              <span className="text-sm">▼</span>
            </button>

            {showProfile && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                ref={profileRef}
              >
                <div className="py-2">
                  <button
                    onClick={() => {
                      onSectionChange('profile');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      onSectionChange('todos');
                      setShowProfile(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Todos
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
