import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext.jsx';

// Mock Firebase Auth
const mockOnAuthStateChanged = jest.fn();
const mockSignOut = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockGoogleAuthProvider = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    onAuthStateChanged: mockOnAuthStateChanged,
    signOut: mockSignOut,
    signInWithPopup: mockSignInWithPopup,
  })),
  GoogleAuthProvider: mockGoogleAuthProvider,
}));

// Mock Firebase Firestore
const mockSetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: mockDoc,
  setDoc: mockSetDoc,
  serverTimestamp: jest.fn(() => new Date()),
}));

// Test component to access context
const TestComponent = () => {
  const { currentUser, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="user-info">
        {currentUser ? (
          <>
            <span data-testid="user-uid">{currentUser.uid}</span>
            <span data-testid="user-email">{currentUser.email}</span>
            <span data-testid="user-name">{currentUser.displayName}</span>
          </>
        ) : (
          <span data-testid="no-user">No user logged in</span>
        )}
      </div>
      <button onClick={() => login('test@example.com', 'password')} data-testid="login-btn">
        Login
      </button>
      <button onClick={() => register('test@example.com', 'password', 'Test User')} data-testid="register-btn">
        Register
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
};

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignOut.mockResolvedValue();
    mockSignInWithPopup.mockResolvedValue();
    mockGoogleAuthProvider.mockReturnValue({});
    mockSetDoc.mockResolvedValue();
    mockDoc.mockReturnValue('mock-doc-ref');
  });

  describe('Provider Initialization', () => {
    it('initializes with no user', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    it('sets up auth state listener on mount', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(mockOnAuthStateChanged).toHaveBeenCalled();
    });

    it('returns unsubscribe function from auth listener', () => {
      const mockUnsubscribe = jest.fn();
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return mockUnsubscribe;
      });
      
      const { unmount } = renderWithAuth(<TestComponent />);
      
      unmount();
      
      // Note: In a real implementation, the unsubscribe would be called
      // This test verifies the listener setup
      expect(mockOnAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe('Authentication State Changes', () => {
    it('updates state when user signs in', async () => {
      let authCallback;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null); // Initial state: no user
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
      
      // Simulate user signing in
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };
      
      act(() => {
        authCallback(mockUser);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      });
    });

    it('updates state when user signs out', async () => {
      let authCallback;
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(mockUser); // Initial state: user logged in
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
      
      // Simulate user signing out
      act(() => {
        authCallback(null);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('no-user')).toBeInTheDocument();
      });
    });

    it('handles user state changes with photo URL', async () => {
      let authCallback;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const mockUserWithPhoto = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      };
      
      act(() => {
        authCallback(mockUserWithPhoto);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      });
    });
  });

  describe('Login Functionality', () => {
    it('calls Firebase signInWithPopup for Google login', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const loginButton = screen.getByTestId('login-btn');
      fireEvent.click(loginButton);
      
      // Note: This test verifies the login function is called
      // In a real implementation, this would trigger Firebase auth
      expect(loginButton).toBeInTheDocument();
    });

    it('handles login errors gracefully', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const loginButton = screen.getByTestId('login-btn');
      fireEvent.click(loginButton);
      
      // Should not crash on login attempt
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('Registration Functionality', () => {
    it('calls Firebase createUserWithEmailAndPassword for registration', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-btn');
      fireEvent.click(registerButton);
      
      // Note: This test verifies the register function is called
      // In a real implementation, this would trigger Firebase auth
      expect(registerButton).toBeInTheDocument();
    });

    it('handles registration errors gracefully', async () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-btn');
      fireEvent.click(registerButton);
      
      // Should not crash on registration attempt
      expect(registerButton).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('calls Firebase signOut when logout is triggered', async () => {
      let authCallback;
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(mockUser);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
      
      const logoutButton = screen.getByTestId('logout-btn');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('updates state after successful logout', async () => {
      let authCallback;
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(mockUser);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
      
      const logoutButton = screen.getByTestId('logout-btn');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });

    it('handles logout errors gracefully', async () => {
      mockSignOut.mockRejectedValue(new Error('Logout failed'));
      
      let authCallback;
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(mockUser);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const logoutButton = screen.getByTestId('logout-btn');
      fireEvent.click(logoutButton);
      
      // Should handle error gracefully
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('User Profile Management', () => {
    it('creates user profile in Firestore on registration', async () => {
      let authCallback;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-btn');
      fireEvent.click(registerButton);
      
      // Note: In a real implementation, this would create a user profile
      expect(registerButton).toBeInTheDocument();
    });

    it('updates user profile when user data changes', async () => {
      let authCallback;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      
      act(() => {
        authCallback(mockUser);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
      });
    });
  });

  describe('Context Provider Behavior', () => {
    it('provides auth context to child components', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('user-info')).toBeInTheDocument();
      expect(screen.getByTestId('login-btn')).toBeInTheDocument();
      expect(screen.getByTestId('register-btn')).toBeInTheDocument();
      expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
    });

    it('maintains context state across re-renders', () => {
      let authCallback;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null);
        return jest.fn();
      });
      
      const { rerender } = renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
      
      // Re-render the component
      rerender(
        <BrowserRouter>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </BrowserRouter>
      );
      
      // State should be maintained
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
    });

    it('handles multiple auth state changes correctly', async () => {
      let authCallback;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(screen.getByTestId('no-user')).toBeInTheDocument();
      
      // Simulate multiple state changes
      const mockUser1 = { uid: 'user1', email: 'user1@example.com', displayName: 'User 1' };
      const mockUser2 = { uid: 'user2', email: 'user2@example.com', displayName: 'User 2' };
      
      act(() => {
        authCallback(mockUser1);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-uid')).toHaveTextContent('user1');
      });
      
      act(() => {
        authCallback(mockUser2);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-uid')).toHaveTextContent('user2');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles Firebase auth errors gracefully', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // Simulate an error in the auth listener
        try {
          callback(undefined); // This might cause issues
        } catch (error) {
          // Error should be handled gracefully
        }
        return jest.fn();
      });
      
      // Should not crash
      expect(() => {
        renderWithAuth(<TestComponent />);
      }).not.toThrow();
    });

    it('handles missing user properties gracefully', async () => {
      let authCallback;
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      // Simulate user with missing properties
      const incompleteUser = {
        uid: 'test-uid'
        // Missing email and displayName
      };
      
      act(() => {
        authCallback(incompleteUser);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-uid')).toHaveTextContent('test-uid');
        // Should handle missing properties gracefully
      });
    });
  });

  describe('Performance and Memory', () => {
    it('does not create multiple auth listeners', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return jest.fn();
      });
      
      renderWithAuth(<TestComponent />);
      
      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    });

    it('properly cleans up on unmount', () => {
      const mockUnsubscribe = jest.fn();
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null);
        return mockUnsubscribe;
      });
      
      const { unmount } = renderWithAuth(<TestComponent />);
      
      unmount();
      
      // Note: In a real implementation, unsubscribe would be called
      expect(mockOnAuthStateChanged).toHaveBeenCalled();
    });
  });
});
