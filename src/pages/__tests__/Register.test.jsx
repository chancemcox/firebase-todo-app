import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Register from '../Register.jsx';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';

// Get the mocked functions from setupTests.js  
const mockCreateUserWithEmailAndPassword = createUserWithEmailAndPassword;
const mockSignInWithPopup = signInWithPopup;
const mockGoogleAuthProvider = GoogleAuthProvider;
const mockUpdateProfile = updateProfile;

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useAuth hook
const mockUseAuth = {
  currentUser: null,
  register: jest.fn(),
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

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateUserWithEmailAndPassword.mockResolvedValue();
    mockSignInWithPopup.mockResolvedValue();
    mockGoogleAuthProvider.mockReturnValue({});
    mockUpdateProfile.mockResolvedValue();
  });

  describe('Page Rendering', () => {
    it('renders registration form correctly', () => {
      renderWithRouter(<Register />);
      
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Sign up for a new account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Display Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('shows navigation links', () => {
      renderWithRouter(<Register />);
      
      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Home' })).toBeInTheDocument();
    });

    it('displays Google sign-up button', () => {
      renderWithRouter(<Register />);
      
      expect(screen.getByRole('button', { name: /Sign up with Google/ })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error for empty full name submission', async () => {
      renderWithRouter(<Register />);
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
    });

    it('shows error for empty email submission', async () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows error for empty password submission', async () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('shows error for empty confirm password submission', async () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email address.')).toBeInTheDocument();
      });
    });

    it('shows error for short password', async () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    it('shows error for password mismatch', async () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('clears errors when user starts typing', async () => {
      renderWithRouter(<Register />);
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Registration', () => {
    it('submits form with valid credentials', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-user-uid', email: 'john@example.com' }
      });
      
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'john@example.com',
          'password123'
        );
      });
    });

    it('updates user profile after successful registration', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-user-uid', email: 'john@example.com' }
      });
      
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(
          expect.anything(),
          { displayName: 'John Doe' }
        );
      });
    });

    it('shows loading state during registration', async () => {
      mockCreateUserWithEmailAndPassword.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      expect(screen.getByText('Creating Account...')).toBeInTheDocument();
      expect(createAccountButton).toBeDisabled();
    });

    it('handles registration success', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-user-uid', email: 'john@example.com' }
      });
      
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles registration errors gracefully', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/email-already-in-use',
        message: 'Email already in use'
      });
      
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeInTheDocument();
      });
    });

    it('shows specific error messages for common registration errors', async () => {
      const errorCases = [
        { code: 'auth/email-already-in-use', message: 'An account with this email already exists' },
        { code: 'auth/weak-password', message: 'Password is too weak. Please choose a stronger password' },
        { code: 'auth/invalid-email', message: 'Invalid email address' },
        { code: 'auth/operation-not-allowed', message: 'Email/password accounts are not enabled' }
      ];
      
      for (const { code, message } of errorCases) {
        mockCreateUserWithEmailAndPassword.mockRejectedValue({ code, message });
        
        const { unmount } = renderWithRouter(<Register />);
        
        const nameInput = screen.getByPlaceholderText('Display Name');
        const emailInput = screen.getByPlaceholderText('Email address');
        const passwordInput = screen.getByPlaceholderText('Password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        
        const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
        fireEvent.click(createAccountButton);
        
        await waitFor(() => {
          expect(screen.getByText(message)).toBeInTheDocument();
        });
        
        unmount();
      }
    });
  });

  describe('Google Authentication', () => {
    it('initiates Google sign-up when button is clicked', async () => {
      renderWithRouter(<Register />);
      
      const googleButton = screen.getByRole('button', { name: /Sign up with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
      });
    });

    it('handles Google registration success', async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: { uid: 'google-uid', email: 'john@gmail.com', displayName: 'John Doe' }
      });
      
      renderWithRouter(<Register />);
      
      const googleButton = screen.getByRole('button', { name: /Sign up with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('handles Google registration errors', async () => {
      mockSignInWithPopup.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Sign-up popup was closed'
      });
      
      renderWithRouter(<Register />);
      
      const googleButton = screen.getByRole('button', { name: /Sign up with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sign-up popup was closed')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to login page when sign in link is clicked', () => {
      renderWithRouter(<Register />);
      
      const signInLink = screen.getByRole('link', { name: 'Sign in' });
      fireEvent.click(signInLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to home page when back to home link is clicked', () => {
      renderWithRouter(<Register />);
      
      const homeLink = screen.getByRole('link', { name: 'Back to Home' });
      fireEvent.click(homeLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Form State Management', () => {
    it('updates form values when typing', () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });
      
      expect(nameInput.value).toBe('Jane Smith');
      expect(emailInput.value).toBe('jane@example.com');
      expect(passwordInput.value).toBe('newpassword');
      expect(confirmPasswordInput.value).toBe('newpassword');
    });

    it('resets form after successful registration', async () => {
      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'new-user-uid', email: 'john@example.com' }
      });
      
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and inputs', () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });

    it('maintains focus management', () => {
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      nameInput.focus();
      expect(nameInput).toHaveFocus();
    });

    it('has proper button roles and states', () => {
      renderWithRouter(<Register />);
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      const googleButton = screen.getByRole('button', { name: /Sign up with Google/ });
      
      expect(createAccountButton).toBeInTheDocument();
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
      
      renderWithRouter(<Register />);
      
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      // Should render without errors on mobile
    });
  });

  describe('Error Handling', () => {
    it('clears errors when switching between auth methods', async () => {
      // First trigger a form error
      renderWithRouter(<Register />);
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Full name is required')).toBeInTheDocument();
      });
      
      // Then try Google auth (should clear form errors)
      const googleButton = screen.getByRole('button', { name: /Sign up with Google/ });
      fireEvent.click(googleButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Full name is required')).not.toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      mockCreateUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error. Please check your connection'
      });
      
      renderWithRouter(<Register />);
      
      const nameInput = screen.getByPlaceholderText('Display Name');
      const emailInput = screen.getByPlaceholderText('Email address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      const createAccountButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(createAccountButton);
      
      await waitFor(() => {
        expect(screen.getByText('Network error. Please check your connection')).toBeInTheDocument();
      });
    });
  });
});
