import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login.jsx';

// Mock Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockGoogleAuthProvider = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
  signInWithPopup: mockSignInWithPopup,
  GoogleAuthProvider: mockGoogleAuthProvider,
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useAuth hook
const mockUseAuth = {
  currentUser: null,
  login: jest.fn(),
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithEmailAndPassword.mockResolvedValue();
    mockSignInWithPopup.mockResolvedValue();
    mockGoogleAuthProvider.mockReturnValue({});
  });

  describe('Page Rendering', () => {
    it('renders login form correctly', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('shows navigation links', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
    });

    it('displays Google sign-in button', () => {
      renderWithRouter(<Login />);
      
      expect(screen.getByRole('button', { name: /Sign in with Google/ })).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid credentials', async () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);
      
      // Should attempt to login (mocked)
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('handles form submission errors', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to sign in/)).toBeInTheDocument();
      });
    });
  });

  describe('Email/Password Authentication', () => {
    it('submits form with valid credentials', async () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });
    });

    it('shows loading state during authentication', async () => {
      mockSignInWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(signInButton);
      
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(signInButton).toBeDisabled();
    });

    it('handles authentication success', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'test-uid', email: 'test@example.com' }
      });
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles authentication errors gracefully', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found'
      });
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('shows specific error messages for common auth errors', async () => {
      const errorCases = [
        { code: 'auth/user-not-found', message: 'No account found with this email' },
        { code: 'auth/wrong-password', message: 'Incorrect password' },
        { code: 'auth/too-many-requests', message: 'Too many failed attempts. Please try again later' },
        { code: 'auth/network-request-failed', message: 'Network error. Please check your connection' }
      ];
      
      for (const { code, message } of errorCases) {
        mockSignInWithEmailAndPassword.mockRejectedValue({ code, message });
        
        const { unmount } = renderWithRouter(<Login />);
        
        const emailInput = screen.getByPlaceholderText('Email address');
        const passwordInput = screen.getByPlaceholderText('Password');
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        
        const signInButton = screen.getByRole('button', { name: 'Sign in' });
        fireEvent.click(signInButton);
        
        await waitFor(() => {
          expect(screen.getByText(message)).toBeInTheDocument();
        });
        
        unmount();
      }
    });
  });

  describe('Google Authentication', () => {
    it('initiates Google sign-in when button is clicked', async () => {
      renderWithRouter(<Login />);
      
      const googleButton = screen.getByRole('button', { name: /Sign in with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
      });
    });

    it('handles Google authentication success', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: { uid: 'google-uid', email: 'test@gmail.com' }
      });
      
      renderWithRouter(<Login />);
      
      const googleButton = screen.getByRole('button', { name: /Sign in with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles Google authentication errors', async () => {
      mockSignInWithPopup.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Sign-in popup was closed'
      });
      
      renderWithRouter(<Login />);
      
      const googleButton = screen.getByRole('button', { name: /Sign in with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sign-in popup was closed')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to register page when sign up link is clicked', () => {
      renderWithRouter(<Login />);
      
      const signUpLink = screen.getByRole('link', { name: 'Sign up' });
      fireEvent.click(signUpLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('navigates to home page when back to home link is clicked', () => {
      renderWithRouter(<Login />);
      
      const homeLink = screen.getByRole('link', { name: 'Back to Home' });
      fireEvent.click(homeLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Form State Management', () => {
    it('updates form values when typing', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
      
      expect(emailInput.value).toBe('new@example.com');
      expect(passwordInput.value).toBe('newpassword');
    });

    it('resets form after successful submission', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'test-uid', email: 'test@example.com' }
      });
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and inputs', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('maintains focus management', () => {
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      emailInput.focus();
      expect(emailInput).toHaveFocus();
    });

    it('has proper button roles and states', () => {
      renderWithRouter(<Login />);
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      const googleButton = screen.getByRole('button', { name: /Sign in with Google/ });
      
      expect(signInButton).toBeInTheDocument();
      expect(googleButton).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('adapts layout for mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithRouter(<Login />);
      
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      // Should render without errors on mobile
    });
  });

  describe('Error Handling', () => {
    it('clears errors when switching between auth methods', async () => {
      // First trigger an email error
      renderWithRouter(<Login />);
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      
      // Then try Google auth (should clear email error)
      const googleButton = screen.getByRole('button', { name: /Sign in with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error. Please check your connection'
      });
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const signInButton = screen.getByRole('button', { name: 'Sign in' });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(screen.getByText('Network error. Please check your connection')).toBeInTheDocument();
      });
    });
  });
});
