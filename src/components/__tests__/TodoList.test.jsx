import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from '../TodoList';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User'
    }
  })
}));

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {},
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock the DateTimeModal component
jest.mock('../DateTimeModal', () => {
  return function MockDateTimeModal({ isOpen, onClose, onSave }) {
    if (!isOpen) return null;
    return (
      <div data-testid="datetime-modal">
        <button onClick={() => onSave({ dueDateTime: new Date().toISOString(), reminder: 'none' })}>
          Save
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

describe('TodoList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the todo list', () => {
    render(<TodoList />);
    
    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByText('Add Todo')).toBeInTheDocument();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Due Today')).toBeInTheDocument();
  });

  it('shows the add todo form', () => {
    render(<TodoList />);
    
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date & Time')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
  });

  it('has filter buttons', () => {
    render(<TodoList />);
    
    const filterButtons = ['All', 'Active', 'Completed', 'Overdue', 'Due Today'];
    filterButtons.forEach(buttonText => {
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });
  });

  it('shows live updates indicator', () => {
    render(<TodoList />);
    
    expect(screen.getByText('Live Updates')).toBeInTheDocument();
  });
});
