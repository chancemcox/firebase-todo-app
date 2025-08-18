import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../Navigation.jsx';

// Mock the useAuth hook
const mockUseAuth = {
  currentUser: {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  },
  logout: jest.fn()
};

// Mock the entire AuthContext module
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

describe('Navigation Component', () => {
  const mockOnSectionChange = jest.fn();
  const defaultProps = {
    activeSection: 'todos',
    onSectionChange: mockOnSectionChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Layout', () => {
    beforeEach(() => {
      // Mock window.innerWidth for desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('renders desktop navigation correctly', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      // Desktop header h1
      expect(screen.getByText('Todo App', { selector: 'h1.text-2xl' })).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      
      // Check navigation tabs (pick the first instance due to mobile+desktop duplicates)
      expect(screen.getAllByRole('button', { name: /My Todos/ })[0]).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Statistics/ })[0]).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Profile/ })[0]).toBeInTheDocument();
    });

    it('shows profile menu when profile button is clicked', async () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const profileButton = screen.getAllByRole('button', { name: /▼/ })[0];
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getAllByText('View Profile')[0]).toBeInTheDocument();
        expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Sign Out')[0]).toBeInTheDocument();
      });
    });

    it('calls onSectionChange when navigation tabs are clicked', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const statsTab = screen.getAllByRole('button', { name: /Statistics/ })[0];
      fireEvent.click(statsTab);
      
      expect(mockOnSectionChange).toHaveBeenCalledWith('stats');
    });

    it('calls onSectionChange when profile menu items are clicked', async () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const profileButton = screen.getAllByRole('button', { name: /▼/ })[0];
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        const viewProfileButton = screen.getAllByText('View Profile')[0];
        fireEvent.click(viewProfileButton);
        expect(mockOnSectionChange).toHaveBeenCalledWith('profile');
      });
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('renders mobile navigation correctly', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      // Mobile header h1
      expect(screen.getByText('Todo App', { selector: 'h1.text-xl' })).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      
      // Check mobile navigation tabs (first instance is fine)
      expect(screen.getAllByRole('button', { name: /My Todos/ })[0]).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Statistics/ })[0]).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Profile/ })[0]).toBeInTheDocument();
    });

    it('shows mobile profile menu when profile button is clicked', async () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const profileButton = screen.getAllByRole('button', { name: /▼/ })[0];
      fireEvent.click(profileButton);
      
      await waitFor(() => {
        expect(screen.getAllByText('View Profile')[0]).toBeInTheDocument();
        expect(screen.getAllByText('My Todos')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Sign Out')[0]).toBeInTheDocument();
      });
    });

    it('calls onSectionChange when mobile navigation tabs are clicked', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const statsTab = screen.getAllByRole('button', { name: /Statistics/ })[0];
      fireEvent.click(statsTab);
      
      expect(mockOnSectionChange).toHaveBeenCalledWith('stats');
    });
  });

  describe('Profile Picture Handling', () => {
    it('displays profile picture when available', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const profileImages = screen.getAllByAltText('Profile');
      expect(profileImages.length).toBeGreaterThan(0);
      expect(profileImages[0].getAttribute('src')).toBe('https://example.com/photo.jpg');
    });

    it('displays user initials when no profile picture', () => {
      const userWithoutPhoto = {
        ...mockUseAuth.currentUser,
        photoURL: null
      };
      
      jest.spyOn(require('../../contexts/AuthContext'), 'useAuth').mockReturnValue({
        ...mockUseAuth,
        currentUser: userWithoutPhoto
      });
      
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const initials = screen.getAllByText('TU');
      expect(initials.length).toBeGreaterThan(0);
    });

    it('handles profile picture load errors gracefully', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const initials = screen.getAllByText('TU');
      expect(initials.length).toBeGreaterThan(0);
      expect(initials[0].closest('div')).toHaveClass('profile-initials');
    });
  });

  describe('Active Section Styling', () => {
    it('applies active styling to current section', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const todosTab = screen.getAllByRole('button', { name: /My Todos/ })[0];
      expect(todosTab.closest('button')).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('applies inactive styling to other sections', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const statsTab = screen.getAllByRole('button', { name: /Statistics/ })[0];
      expect(statsTab.closest('button')).toHaveClass('text-gray-600');
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const profileButton = screen.getAllByRole('button', { name: /▼/ })[0];
      expect(profileButton).toBeInTheDocument();
      
      const todosTab = screen.getAllByRole('button', { name: /My Todos/ })[0];
      expect(todosTab).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      renderWithRouter(<Navigation {...defaultProps} />);
      
      const profileButton = screen.getAllByRole('button', { name: /▼/ })[0];
      profileButton.focus();
      expect(profileButton).toHaveFocus();
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts layout based on screen size', () => {
      const { rerender } = renderWithRouter(<Navigation {...defaultProps} />);
      
      // Test desktop layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      rerender(<Navigation {...defaultProps} />);
      // Check for desktop title (larger text)
      const desktopTitle = screen.getByText('Todo App', { selector: 'h1.text-2xl' });
      expect(desktopTitle).toBeInTheDocument();
      
      // Test mobile layout
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      rerender(<Navigation {...defaultProps} />);
      // Check for mobile title (smaller text)
      const mobileTitle = screen.getByText('Todo App', { selector: 'h1.text-xl' });
      expect(mobileTitle).toBeInTheDocument();
    });
  });
});
