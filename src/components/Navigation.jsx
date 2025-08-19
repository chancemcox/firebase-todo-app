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

  // Debug state changes
  useEffect(() => {
    console.log('showProfile state changed to:', showProfile);
    if (showProfile) {
      console.log('🎯 DROPDOWN SHOULD BE VISIBLE NOW!');
      console.log('🔍 Check for element with red border and yellow background');
      // Force a DOM check
      setTimeout(() => {
        const dropdowns = document.querySelectorAll('[style*="border: 5px solid red"]');
        console.log('Found dropdowns with red border:', dropdowns.length);
        dropdowns.forEach((dropdown, index) => {
          console.log(`Dropdown ${index}:`, dropdown);
          console.log('Dropdown visible:', dropdown.offsetParent !== null);
          console.log('Dropdown dimensions:', dropdown.offsetWidth, 'x', dropdown.offsetHeight);
          
          // Check parent container for mobile dropdown
          if (index === 0) { // Mobile dropdown
            const parent = dropdown.parentElement;
            console.log('Mobile dropdown parent:', parent);
            console.log('Parent position:', parent.style.position);
            console.log('Parent overflow:', parent.style.overflow);
            console.log('Parent dimensions:', parent.offsetWidth, 'x', parent.offsetHeight);
            
            // Check the button dimensions
            const button = parent.querySelector('button');
            if (button) {
              console.log('Button dimensions:', button.offsetWidth, 'x', button.offsetHeight);
              console.log('Button content:', button.textContent);
              console.log('Button display:', button.style.display);
            }
            
            // Check if dropdown is within viewport
            const rect = dropdown.getBoundingClientRect();
            console.log('Dropdown bounding rect:', rect);
            console.log('Viewport dimensions:', window.innerWidth, 'x', window.innerHeight);
          }
        });
      }, 100);
    }
  }, [showProfile]);

  // Move dropdown to body to avoid stacking context issues
  useEffect(() => {
    if (showProfile && profileRef.current) {
      // Move dropdown to body to avoid parent clipping
      document.body.appendChild(profileRef.current);
      
      return () => {
        // Clean up when component unmounts or dropdown closes
        if (profileRef.current && profileRef.current.parentNode === document.body) {
          document.body.removeChild(profileRef.current);
        }
      };
    }
  }, [showProfile]);

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
    const newState = !showProfile;
    console.log('Setting new state to:', newState);
    setShowProfile(newState);
    console.log('State update triggered');
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
          <div 
            className={`relative profile-container ${showProfile ? 'mobile-dropdown-open' : ''}`}
            data-dropdown-open={showProfile}
            style={{
              position: 'relative',
              display: 'inline-block',
              minWidth: '120px',
              minHeight: '40px',
              overflow: 'visible'
            }}
          >
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                minWidth: '120px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {currentUser?.displayName || currentUser?.email || 'Profile'}
                </span>
              </div>
              
              <span className="text-sm">▼</span>
            </button>

            {showProfile && (
              <div 
                ref={profileRef}
                style={{ 
                  minWidth: '280px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  zIndex: 999999,
                  position: 'fixed',
                  top: '80px',
                  right: '20px',
                  padding: '0',
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: '#374151',
                  display: 'block',
                  visibility: 'visible',
                  opacity: '1',
                  width: 'auto',
                  height: 'auto',
                  overflow: 'visible',
                  transform: 'translateZ(0)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ padding: '16px' }}>
                  {/* User Info Header */}
                  <div style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f3f4f6',
                    marginBottom: '8px'
                  }}>
                    <p style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      {currentUser?.displayName || 'User'}
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      margin: '0'
                    }}>
                      {currentUser?.email}
                    </p>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={() => {
                        onSectionChange('profile');
                        setShowProfile(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#374151',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontSize: '18px' }}>👤</span>
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        onSectionChange('todos');
                        setShowProfile(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#374151',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontSize: '18px' }}>📝</span>
                      My Todos
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div style={{ 
                    height: '1px', 
                    backgroundColor: '#f3f4f6', 
                    margin: '8px 0' 
                  }} />
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '18px' }}>🚪</span>
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
                ref={profileRef}
                style={{ 
                  minWidth: '280px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  zIndex: 999999,
                  position: 'fixed',
                  top: '80px',
                  right: '20px',
                  padding: '0',
                  fontSize: '14px',
                  fontWeight: 'normal',
                  color: '#374151',
                  display: 'block',
                  visibility: 'visible',
                  opacity: '1',
                  width: 'auto',
                  height: 'auto',
                  overflow: 'visible',
                  transform: 'translateZ(0)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ padding: '16px' }}>
                  {/* User Info Header */}
                  <div style={{ 
                    padding: '12px 16px', 
                    borderBottom: '1px solid #f3f4f6',
                    marginBottom: '8px'
                  }}>
                    <p style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#111827',
                      margin: '0 0 4px 0'
                    }}>
                      {currentUser?.displayName || 'User'}
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#6b7280',
                      margin: '0'
                    }}>
                      {currentUser?.email}
                    </p>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={() => {
                        onSectionChange('profile');
                        setShowProfile(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#374151',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontSize: '18px' }}>👤</span>
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        onSectionChange('todos');
                        setShowProfile(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: '#374151',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontSize: '18px' }}>📝</span>
                      My Todos
                    </button>
                  </div>
                  
                  {/* Divider */}
                  <div style={{ 
                    height: '1px', 
                    backgroundColor: '#f3f4f6', 
                    margin: '8px 0' 
                  }} />
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '18px' }}>🚪</span>
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
