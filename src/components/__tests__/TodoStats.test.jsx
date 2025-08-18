import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoStats from '../TodoStats';

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
}));

describe('TodoStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the statistics page', () => {
    render(<TodoStats />);
    
    expect(screen.getByText('Real-Time Statistics')).toBeInTheDocument();
    expect(screen.getByText('Live Updates Active')).toBeInTheDocument();
  });

  it('shows summary cards', () => {
    render(<TodoStats />);
    
    // Use getAllByText to get the first instance (summary card headers)
    expect(screen.getAllByText('Total Todos')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Completed')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Active')[0]).toBeInTheDocument();
  });

  it('shows completion rate section', () => {
    render(<TodoStats />);
    
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('shows priority breakdown section', () => {
    render(<TodoStats />);
    
    expect(screen.getByText('Priority Breakdown')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
    expect(screen.getByText('Low Priority')).toBeInTheDocument();
  });

  it('shows due date overview section', () => {
    render(<TodoStats />);
    
    expect(screen.getByText('Due Date Overview')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Due Today')).toBeInTheDocument();
    expect(screen.getByText('Due Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Due Later')).toBeInTheDocument();
    expect(screen.getByText('No Due Date')).toBeInTheDocument();
  });

  it('shows recent activity section', () => {
    render(<TodoStats />);
    
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('shows live updates indicator', () => {
    render(<TodoStats />);
    
    expect(screen.getByText('Live Updates Active')).toBeInTheDocument();
  });
});
