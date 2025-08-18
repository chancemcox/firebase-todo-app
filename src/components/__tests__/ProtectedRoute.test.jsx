import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute.jsx';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useAuth hook
const mockUseAuth = {
  currentUser: null,
  loading: false,
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

// Test components
const TestProtectedComponent = () => (
  <div data-testid="protected-content">
    <h1>Protected Content</h1>
    <p>This content is only visible to authenticated users</p>
  </div>
);

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Authentication States', () => {
    it('renders protected content when user is authenticated', () => {
      mockUseAuth.currentUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.getByText('This content is only visible to authenticated users')).toBeInTheDocument();
    });

    it('redirects to login when user is not authenticated', () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('shows loading state while authentication is being determined', () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = true;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      // Should show loading state
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('User Authentication Scenarios', () => {
    it('handles user with complete profile information', () => {
      mockUseAuth.currentUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true
      };
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles user with minimal profile information', () => {
      mockUseAuth.currentUser = {
        uid: 'test-uid',
        email: 'test@example.com'
        // Missing displayName and photoURL
      };
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles user with only UID', () => {
      mockUseAuth.currentUser = {
        uid: 'test-uid'
        // Missing email and other properties
      };
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Loading State Behavior', () => {
    it('prevents navigation during loading', () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = true;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('transitions from loading to authenticated state', async () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = true;
      
      const { rerender } = renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      // Initially loading
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      
      // Transition to authenticated
      mockUseAuth.currentUser = { uid: 'test-uid', email: 'test@example.com' };
      mockUseAuth.loading = false;
      
      rerender(
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <TestProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('transitions from loading to unauthenticated state', async () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = true;
      
      const { rerender } = renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      // Initially loading
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Transition to unauthenticated
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = false;
      
      rerender(
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <TestProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Navigation Behavior', () => {
    it('redirects to login page when unauthenticated', () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('does not redirect when user is authenticated', () => {
      mockUseAuth.currentUser = { uid: 'test-uid', email: 'test@example.com' };
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles multiple route changes correctly', () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = false;
      
      const { rerender } = renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      
      // Change to authenticated state
      mockUseAuth.currentUser = { uid: 'test-uid', email: 'test@example.com' };
      
      rerender(
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <TestProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Component Rendering', () => {
    it('renders children when authenticated', () => {
      mockUseAuth.currentUser = { uid: 'test-uid', email: 'test@example.com' };
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('does not render children when unauthenticated', () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders complex nested components when authenticated', () => {
      mockUseAuth.currentUser = { uid: 'test-uid', email: 'test@example.com' };
      mockUseAuth.loading = false;
      
      const ComplexComponent = () => (
        <div data-testid="complex-component">
          <header>
            <h1>Dashboard</h1>
          </header>
          <main>
            <section>
              <h2>Welcome</h2>
              <p>You are logged in!</p>
            </section>
            <section>
              <h2>Actions</h2>
              <button>Create Todo</button>
              <button>View Profile</button>
            </section>
          </main>
        </div>
      );
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ComplexComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('complex-component')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('You are logged in!')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Create Todo')).toBeInTheDocument();
      expect(screen.getByText('View Profile')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined currentUser gracefully', () => {
      mockUseAuth.currentUser = undefined;
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles null currentUser gracefully', () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles empty object currentUser gracefully', () => {
      mockUseAuth.currentUser = {};
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      // Empty object should be treated as unauthenticated
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles currentUser with only falsy values', () => {
      mockUseAuth.currentUser = {
        uid: '',
        email: null,
        displayName: undefined
      };
      mockUseAuth.loading = false;
      
      renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      // Should still be treated as unauthenticated
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Performance and Re-renders', () => {
    it('does not cause unnecessary re-renders when authenticated', () => {
      mockUseAuth.currentUser = { uid: 'test-uid', email: 'test@example.com' };
      mockUseAuth.loading = false;
      
      const { rerender } = renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      
      // Re-render with same props
      rerender(
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <TestProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      );
      
      // Should still show protected content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles rapid authentication state changes', async () => {
      mockUseAuth.currentUser = null;
      mockUseAuth.loading = false;
      
      const { rerender } = renderWithRouter(
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TestProtectedComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      );
      
      // Initially unauthenticated
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      
      // Rapid state changes
      mockUseAuth.currentUser = { uid: 'test-uid', email: 'test@example.com' };
      rerender(
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <TestProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      );
      
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      
      mockUseAuth.currentUser = null;
      rerender(
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <TestProtectedComponent />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });
});
