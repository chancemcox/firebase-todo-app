import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '../UserProfile.jsx';

// Mock Firebase Firestore completely
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => ({ id: 'test-doc-id' })),
  collection: jest.fn(() => ({ id: 'test-collection-id' })),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  getFirestore: jest.fn(() => ({})),
}));

// Mock the useAuth hook
const mockUseAuth = {
  currentUser: {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  }
};

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

// Mock Firebase completely
jest.mock('../../firebase', () => ({
  db: {},
  auth: {},
  googleProvider: {}
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful Firestore update
    const { updateDoc } = require('firebase/firestore');
    updateDoc.mockResolvedValue();
    
    // Mock Firestore listener
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((_docRef, callback) => {
      callback({
        data: () => ({
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'https://example.com/photo.jpg',
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date('2024-01-15'),
          emailVerified: true,
          providerData: [
            { providerId: 'google.com', displayName: 'Test User' }
          ]
        }),
        exists: () => true
      });
      return jest.fn(); // Return mock unsubscribe function
    });
  });

  describe('Profile Display', () => {
    it('renders user profile information correctly', async () => {
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Test User')[0]).toBeInTheDocument();
        expect(screen.getAllByText('test@example.com')[0]).toBeInTheDocument();
        expect(screen.getByText('test-user-id')).toBeInTheDocument();
      });
    });

    it('displays profile picture when available', async () => {
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        const profileImage = screen.getByAltText('Profile');
        expect(profileImage).toBeInTheDocument();
        expect(profileImage.src).toBe('https://example.com/photo.jpg');
      });
    });

    it('displays user initials when no profile picture', async () => {
      // Mock onSnapshot to return user without photo
      const { onSnapshot } = require('firebase/firestore');
      onSnapshot.mockImplementation((_docRef, callback) => {
        callback({
          data: () => ({
            uid: 'test-user-id',
            email: 'test@example.com',
            displayName: 'Test User',
            photoURL: null,
            createdAt: new Date('2024-01-01'),
            lastLoginAt: new Date('2024-01-15'),
            emailVerified: true,
            providerData: [
              { providerId: 'google.com', displayName: 'Test User' }
            ]
          }),
          exists: () => true
        });
        return jest.fn();
      });
      
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        expect(screen.getByText('TU')).toBeInTheDocument(); // Test User initials
      });
    });

    it('shows account information section', async () => {
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        expect(screen.getByText('Account Information')).toBeInTheDocument();
        expect(screen.getByText('User ID')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Display Name')).toBeInTheDocument();
      });
    });

    it('shows authentication status section', async () => {
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        expect(screen.getByText('Authentication Status')).toBeInTheDocument();
        expect(screen.getByText('Email Verified')).toBeInTheDocument();
        expect(screen.getByText('Provider')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Editing', () => {
    it('enables editing mode when edit button is clicked', async () => {
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);
      });
      
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('saves profile changes successfully', async () => {
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);
      });
      
      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      // Verify that the save operation was attempted
      const { updateDoc } = require('firebase/firestore');
      expect(updateDoc).toHaveBeenCalled();
      
      // The component should return to display mode after save
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
    });

    it('cancels editing mode', async () => {
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);
      });
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        expect(screen.queryByText('Save')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles Firestore errors gracefully', async () => {
      const { onSnapshot } = require('firebase/firestore');
      onSnapshot.mockImplementation((_docRef, callback, errorCallback) => {
        errorCallback(new Error('Firestore error'));
        return jest.fn();
      });
      
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
      });
    });

    it('handles profile update errors', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockRejectedValue(new Error('Update failed'));
      
      renderWithRouter(<UserProfile />);
      
      await waitFor(() => {
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);
      });
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
      });
    });
  });
});
