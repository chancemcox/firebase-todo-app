import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DateTimeModal from '../DateTimeModal';

// Mock the component since it uses Firebase
jest.mock('../../firebase', () => ({
  db: {},
}));

describe('DateTimeModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <DateTimeModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Set Due Date & Time')).toBeInTheDocument();
    expect(screen.getByText('Quick Select')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Reminder')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <DateTimeModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.queryByText('Set Due Date & Time')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(
      <DateTimeModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Find the close button by its SVG icon (X symbol)
    const closeButton = screen.getByRole('button', { 
      name: '' // The button has no text, just an SVG icon
    });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('has quick select buttons', () => {
    render(
      <DateTimeModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Today 6 PM')).toBeInTheDocument();
    expect(screen.getByText('Tomorrow 9 AM')).toBeInTheDocument();
    expect(screen.getByText('Next Week')).toBeInTheDocument();
    expect(screen.getByText('Next Month')).toBeInTheDocument();
  });

  it('shows reminder options', () => {
    render(
      <DateTimeModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('No reminder')).toBeInTheDocument();
    expect(screen.getByText('5 minutes before')).toBeInTheDocument();
    expect(screen.getByText('15 minutes before')).toBeInTheDocument();
    expect(screen.getByText('30 minutes before')).toBeInTheDocument();
    expect(screen.getByText('1 hour before')).toBeInTheDocument();
    expect(screen.getByText('1 day before')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('has action buttons', () => {
    render(
      <DateTimeModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Remove Due Date')).toBeInTheDocument();
    expect(screen.getByText('Set Due Date')).toBeInTheDocument();
  });
});
